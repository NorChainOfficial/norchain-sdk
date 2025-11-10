import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LedgerAccount, AccountType, AccountStatus } from './entities/ledger-account.entity';
import { JournalEntry, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalLine, LineDirection } from './entities/journal-line.entity';
import { PeriodClosure } from './entities/period-closure.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto, JournalLineDto } from './dto/create-journal-entry.dto';
import { ClosePeriodDto } from './dto/close-period.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createHash } from 'crypto';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectRepository(LedgerAccount)
    private readonly accountRepository: Repository<LedgerAccount>,
    @InjectRepository(JournalEntry)
    private readonly entryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalLine)
    private readonly lineRepository: Repository<JournalLine>,
    @InjectRepository(PeriodClosure)
    private readonly closureRepository: Repository<PeriodClosure>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a ledger account
   */
  async createAccount(dto: CreateAccountDto, userId: string): Promise<LedgerAccount> {
    // Check if account code already exists for this org
    const existing = await this.accountRepository.findOne({
      where: { orgId: dto.orgId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Account with code ${dto.code} already exists for this organization`,
      );
    }

    // Validate parent if provided
    if (dto.parentId) {
      const parent = await this.accountRepository.findOne({
        where: { id: dto.parentId, orgId: dto.orgId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent account ${dto.parentId} not found`);
      }
    }

    const account = this.accountRepository.create({
      ...dto,
      status: AccountStatus.ACTIVE,
    });

    const saved = await this.accountRepository.save(account);
    this.logger.log(`Created ledger account: ${saved.code} - ${saved.name}`);

    return saved;
  }

  /**
   * List accounts for an organization
   */
  async listAccounts(orgId: string, status?: AccountStatus): Promise<LedgerAccount[]> {
    const where: any = { orgId };
    if (status) {
      where.status = status;
    }

    return this.accountRepository.find({
      where,
      relations: ['parent', 'children'],
      order: { code: 'ASC' },
    });
  }

  /**
   * Get account by ID
   */
  async getAccount(id: string, orgId: string): Promise<LedgerAccount> {
    const account = await this.accountRepository.findOne({
      where: { id, orgId },
      relations: ['parent', 'children'],
    });

    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }

    return account;
  }

  /**
   * Create a journal entry with double-entry validation
   */
  async createJournalEntry(
    dto: CreateJournalEntryDto,
    userId: string,
  ): Promise<JournalEntry> {
    // Check if entry already exists (idempotency)
    const existing = await this.entryRepository.findOne({
      where: { orgId: dto.orgId, eventType: dto.eventType, eventId: dto.eventId },
    });

    if (existing) {
      this.logger.warn(
        `Journal entry already exists for event ${dto.eventType}:${dto.eventId}`,
      );
      return existing;
    }

    // Check if period is locked
    const closure = await this.closureRepository.findOne({
      where: { orgId: dto.orgId, period: dto.period },
    });

    if (closure) {
      throw new ConflictException(`Period ${dto.period} is locked and cannot be modified`);
    }

    // Validate double-entry: sum(debits) == sum(credits) per currency
    const validation = this.validateDoubleEntry(dto.lines);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Resolve account IDs from codes
    const resolvedLines = await this.resolveAccountIds(dto.orgId, dto.lines);

    // Create entry and lines in a transaction
    const entry = await this.dataSource.transaction(async (manager) => {
      const entryEntity = manager.create(JournalEntry, {
        orgId: dto.orgId,
        eventType: dto.eventType,
        eventId: dto.eventId,
        txHash: dto.txHash,
        blockNo: dto.blockNo,
        occurredAt: new Date(dto.occurredAt),
        period: dto.period,
        memo: dto.memo,
        status: JournalEntryStatus.POSTED,
      });

      const savedEntry = await manager.save(entryEntity);

      // Create journal lines
      const lines = resolvedLines.map((line) =>
        manager.create(JournalLine, {
          entryId: savedEntry.id,
          accountId: line.accountId,
          currency: line.currency,
          amount: line.amount,
          direction: line.direction,
          fxRate: line.fxRate || '1.0',
          amountNative: this.calculateNativeAmount(line.amount, line.fxRate || '1.0'),
        }),
      );

      await manager.save(lines);

      return savedEntry;
    });

    // Load entry with lines
    const entryWithLines = await this.entryRepository.findOne({
      where: { id: entry.id },
      relations: ['lines', 'lines.account'],
    });

    this.logger.log(`Created journal entry: ${entry.id} for event ${dto.eventType}:${dto.eventId}`);

    // Emit event for other modules (e.g., payments, swaps)
    this.eventEmitter.emit('ledger.entry.created', {
      entryId: entry.id,
      eventType: dto.eventType,
      eventId: dto.eventId,
      orgId: dto.orgId,
    });

    return entryWithLines!;
  }

  /**
   * Get journal entry by ID
   */
  async getJournalEntry(id: string, orgId: string): Promise<JournalEntry> {
    const entry = await this.entryRepository.findOne({
      where: { id, orgId },
      relations: ['lines', 'lines.account'],
    });

    if (!entry) {
      throw new NotFoundException(`Journal entry ${id} not found`);
    }

    return entry;
  }

  /**
   * Get account statement (trial balance / movements)
   */
  async getAccountStatement(
    accountId: string,
    orgId: string,
    fromDate?: Date,
    toDate?: Date,
  ) {
    const account = await this.getAccount(accountId, orgId);

    const query = this.lineRepository
      .createQueryBuilder('line')
      .innerJoin('line.entry', 'entry')
      .where('line.accountId = :accountId', { accountId })
      .andWhere('entry.orgId = :orgId', { orgId })
      .andWhere('entry.status = :status', { status: JournalEntryStatus.POSTED });

    if (fromDate) {
      query.andWhere('entry.occurredAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      query.andWhere('entry.occurredAt <= :toDate', { toDate });
    }

    const lines = await query
      .orderBy('entry.occurredAt', 'ASC')
      .addOrderBy('line.createdAt', 'ASC')
      .getMany();

    // Calculate running balance
    let balance = '0';
    const movements = lines.map((line) => {
      const amount = BigInt(line.amount.replace('.', ''));
      if (line.direction === LineDirection.DEBIT) {
        balance = (BigInt(balance.replace('.', '')) + amount).toString();
      } else {
        balance = (BigInt(balance.replace('.', '')) - amount).toString();
      }

      return {
        ...line,
        runningBalance: balance,
      };
    });

    return {
      account,
      fromDate: fromDate || null,
      toDate: toDate || null,
      movements,
      finalBalance: balance,
    };
  }

  /**
   * Close a period and create Merkle anchor
   */
  async closePeriod(dto: ClosePeriodDto, userId: string): Promise<PeriodClosure> {
    // Check if already closed
    const existing = await this.closureRepository.findOne({
      where: { orgId: dto.orgId, period: dto.period },
    });

    if (existing) {
      throw new ConflictException(`Period ${dto.period} is already closed`);
    }

    // Get all entries for the period
    const entries = await this.entryRepository.find({
      where: {
        orgId: dto.orgId,
        period: dto.period,
        status: JournalEntryStatus.POSTED,
      },
      relations: ['lines'],
      order: { occurredAt: 'ASC' },
    });

    // Calculate Merkle root (simplified - in production, use proper Merkle tree)
    const merkleRoot = this.calculateMerkleRoot(entries);

    const closure = this.closureRepository.create({
      period: dto.period,
      orgId: dto.orgId,
      lockedBy: userId,
      lockedAt: new Date(),
      merkleRoot,
    });

    const saved = await this.closureRepository.save(closure);

    this.logger.log(`Closed period ${dto.period} for org ${dto.orgId} with Merkle root ${merkleRoot}`);

    // Emit event for on-chain anchoring (can be handled by a separate service)
    this.eventEmitter.emit('ledger.period.closed', {
      closureId: saved.id,
      period: dto.period,
      orgId: dto.orgId,
      merkleRoot,
    });

    return saved;
  }

  /**
   * Get period closure with anchor transaction
   */
  async getPeriodClosure(period: string, orgId: string): Promise<PeriodClosure> {
    const closure = await this.closureRepository.findOne({
      where: { period, orgId },
    });

    if (!closure) {
      throw new NotFoundException(`Period ${period} is not closed`);
    }

    return closure;
  }

  /**
   * Validate double-entry: sum(debits) == sum(credits) per currency
   */
  private validateDoubleEntry(lines: JournalLineDto[]): { valid: boolean; error?: string } {
    const balances: Record<string, { debit: string; credit: string }> = {};

    for (const line of lines) {
      if (!balances[line.currency]) {
        balances[line.currency] = { debit: '0', credit: '0' };
      }

      const debitAmount = line.direction === LineDirection.DEBIT ? line.amount : '0';
      const creditAmount = line.direction === LineDirection.CREDIT ? line.amount : '0';

      balances[line.currency].debit = (
        parseFloat(balances[line.currency].debit) + parseFloat(debitAmount)
      ).toString();
      balances[line.currency].credit = (
        parseFloat(balances[line.currency].credit) + parseFloat(creditAmount)
      ).toString();
    }

    // Check if debits == credits for each currency
    for (const [currency, balance] of Object.entries(balances)) {
      const debitTotal = parseFloat(balance.debit);
      const creditTotal = parseFloat(balance.credit);

      if (Math.abs(debitTotal - creditTotal) > 0.00000001) {
        // Allow for floating point precision
        return {
          valid: false,
          error: `Double-entry validation failed for ${currency}: debits=${debitTotal}, credits=${creditTotal}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Resolve account IDs from account codes
   */
  private async resolveAccountIds(
    orgId: string,
    lines: JournalLineDto[],
  ): Promise<Array<JournalLineDto & { accountId: string }>> {
    const accountCodes = lines.map((l) => l.account);
    
    // Try to find accounts by code first
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .where('account.orgId = :orgId', { orgId })
      .andWhere('account.code IN (:...codes)', { codes: accountCodes })
      .getMany();

    const accountMap = new Map(accounts.map((a) => [a.code, a.id]));

    // For accounts not found by code, try by UUID
    const unresolved = lines.filter((l) => !accountMap.has(l.account));
    if (unresolved.length > 0) {
      const uuids = unresolved.map((l) => l.account).filter((id) => id.length === 36);
      if (uuids.length > 0) {
        const accountsByUuid = await this.accountRepository
          .createQueryBuilder('account')
          .where('account.orgId = :orgId', { orgId })
          .andWhere('account.id IN (:...uuids)', { uuids })
          .getMany();
        
        accountsByUuid.forEach((a) => accountMap.set(a.id, a.id));
      }
    }

    return lines.map((line) => {
      const accountId = accountMap.get(line.account);
      if (!accountId) {
        throw new NotFoundException(`Account ${line.account} not found`);
      }
      return { ...line, accountId };
    });
  }

  /**
   * Calculate native amount (NOR) from amount and FX rate
   */
  private calculateNativeAmount(amount: string, fxRate: string): string {
    return (parseFloat(amount) * parseFloat(fxRate)).toString();
  }

  /**
   * Calculate Merkle root of journal entries (simplified)
   */
  private calculateMerkleRoot(entries: JournalEntry[]): string {
    // In production, use a proper Merkle tree implementation
    // For now, create a hash of all entry IDs and their line hashes
    const entryHashes = entries.map((entry) => {
      const lineHashes = entry.lines
        .map((line) => `${line.accountId}:${line.amount}:${line.direction}`)
        .join('|');
      return createHash('sha256')
        .update(`${entry.id}:${entry.eventType}:${entry.eventId}:${lineHashes}`)
        .digest('hex');
    });

    const combined = entryHashes.join('');
    return createHash('sha256').update(combined).digest('hex');
  }
}

