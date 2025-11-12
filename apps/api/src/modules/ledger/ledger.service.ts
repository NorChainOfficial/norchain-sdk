import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThanOrEqual } from 'typeorm';
import {
  LedgerAccount,
  AccountType,
  AccountStatus,
} from './entities/ledger-account.entity';
import {
  JournalEntry,
  JournalEntryStatus,
} from './entities/journal-entry.entity';
import { JournalLine, LineDirection } from './entities/journal-line.entity';
import { PeriodClosure } from './entities/period-closure.entity';
import {
  Reconciliation,
  ReconciliationStatus,
  ReconciliationType,
} from './entities/reconciliation.entity';
import {
  ReconciliationMatch,
  MatchType,
} from './entities/reconciliation-match.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import {
  CreateJournalEntryDto,
  JournalLineDto,
} from './dto/create-journal-entry.dto';
import { ClosePeriodDto } from './dto/close-period.dto';
import { CalculateVatDto, VatRate, VatType } from './dto/calculate-vat.dto';
import {
  GetFinancialReportDto,
  ReportType,
  ReportPeriod,
} from './dto/get-financial-report.dto';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { MatchTransactionDto } from './dto/match-transaction.dto';
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
    @InjectRepository(Reconciliation)
    private readonly reconciliationRepository: Repository<Reconciliation>,
    @InjectRepository(ReconciliationMatch)
    private readonly reconciliationMatchRepository: Repository<ReconciliationMatch>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a ledger account
   */
  async createAccount(
    dto: CreateAccountDto,
    userId: string,
  ): Promise<LedgerAccount> {
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
  async listAccounts(
    orgId: string,
    status?: AccountStatus,
  ): Promise<LedgerAccount[]> {
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
      where: {
        orgId: dto.orgId,
        eventType: dto.eventType,
        eventId: dto.eventId,
      },
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
      throw new ConflictException(
        `Period ${dto.period} is locked and cannot be modified`,
      );
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
          amountNative: this.calculateNativeAmount(
            line.amount,
            line.fxRate || '1.0',
          ),
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

    this.logger.log(
      `Created journal entry: ${entry.id} for event ${dto.eventType}:${dto.eventId}`,
    );

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
      .andWhere('entry.status = :status', {
        status: JournalEntryStatus.POSTED,
      });

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
  async closePeriod(
    dto: ClosePeriodDto,
    userId: string,
  ): Promise<PeriodClosure> {
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

    this.logger.log(
      `Closed period ${dto.period} for org ${dto.orgId} with Merkle root ${merkleRoot}`,
    );

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
  async getPeriodClosure(
    period: string,
    orgId: string,
  ): Promise<PeriodClosure> {
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
  private validateDoubleEntry(lines: JournalLineDto[]): {
    valid: boolean;
    error?: string;
  } {
    const balances: Record<string, { debit: string; credit: string }> = {};

    for (const line of lines) {
      if (!balances[line.currency]) {
        balances[line.currency] = { debit: '0', credit: '0' };
      }

      const debitAmount =
        line.direction === LineDirection.DEBIT ? line.amount : '0';
      const creditAmount =
        line.direction === LineDirection.CREDIT ? line.amount : '0';

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
      const uuids = unresolved
        .map((l) => l.account)
        .filter((id) => id.length === 36);
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
  private calculateNativeAmount(amount: string, fxRate?: string): string {
    if (!fxRate) {
      return amount; // Return original amount if no FX rate provided
    }
    const result = parseFloat(amount) * parseFloat(fxRate);
    return isNaN(result) ? amount : result.toString();
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

  /**
   * Calculate VAT/MVA
   */
  async calculateVat(dto: CalculateVatDto): Promise<{
    amountExcludingVat: string;
    vatAmount: string;
    amountIncludingVat: string;
    vatRate: number;
    vatType: VatType;
    countryCode?: string;
    vatAccountCode?: string;
  }> {
    const amountExcludingVat = parseFloat(dto.amountExcludingVat);
    const vatRateDecimal = dto.vatRate / 100;
    const vatAmount = amountExcludingVat * vatRateDecimal;
    const amountIncludingVat = amountExcludingVat + vatAmount;

    // Find VAT account if account code provided
    let vatAccountCode = dto.vatAccountCode;
    if (!vatAccountCode) {
      // Default VAT account codes based on country and type
      if (dto.countryCode === 'NO' || !dto.countryCode) {
        // Norwegian MVA accounts
        vatAccountCode = dto.vatType === VatType.INPUT ? '2700' : '2701'; // Input MVA / Output MVA
      } else if (
        [
          'AT',
          'BE',
          'BG',
          'CY',
          'CZ',
          'DE',
          'DK',
          'EE',
          'ES',
          'FI',
          'FR',
          'GR',
          'HR',
          'HU',
          'IE',
          'IT',
          'LT',
          'LU',
          'LV',
          'MT',
          'NL',
          'PL',
          'PT',
          'RO',
          'SE',
          'SI',
          'SK',
        ].includes(dto.countryCode)
      ) {
        // EU VAT accounts
        vatAccountCode = dto.vatType === VatType.INPUT ? '2710' : '2711'; // Input VAT / Output VAT
      } else {
        // GCC or other
        vatAccountCode = dto.vatType === VatType.INPUT ? '2720' : '2721'; // Input VAT / Output VAT
      }
    }

    return {
      amountExcludingVat: amountExcludingVat.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      amountIncludingVat: amountIncludingVat.toFixed(2),
      vatRate: dto.vatRate,
      vatType: dto.vatType,
      countryCode: dto.countryCode,
      vatAccountCode,
    };
  }

  /**
   * Generate financial report (P&L, Balance Sheet, Cashflow)
   */
  async getFinancialReport(dto: GetFinancialReportDto): Promise<any> {
    // Determine date range based on period
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    if (dto.period === ReportPeriod.CUSTOM && dto.startDate && dto.endDate) {
      startDate = new Date(dto.startDate);
      endDate = new Date(dto.endDate);
      periodLabel = `${dto.startDate} to ${dto.endDate}`;
    } else if (dto.periodIdentifier) {
      // Parse period identifier (e.g., "2025-01", "2025-Q1", "2025")
      if (dto.periodIdentifier.match(/^\d{4}-\d{2}$/)) {
        // Monthly: "2025-01"
        const [year, month] = dto.periodIdentifier.split('-');
        startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        periodLabel = dto.periodIdentifier;
      } else if (dto.periodIdentifier.match(/^\d{4}-Q[1-4]$/)) {
        // Quarterly: "2025-Q1"
        const [year, quarter] = dto.periodIdentifier.split('-Q');
        const quarterNum = parseInt(quarter);
        startDate = new Date(parseInt(year), (quarterNum - 1) * 3, 1);
        endDate = new Date(parseInt(year), quarterNum * 3, 0, 23, 59, 59);
        periodLabel = dto.periodIdentifier;
      } else if (dto.periodIdentifier.match(/^\d{4}$/)) {
        // Yearly: "2025"
        const year = parseInt(dto.periodIdentifier);
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59);
        periodLabel = dto.periodIdentifier;
      } else {
        throw new BadRequestException('Invalid period identifier format');
      }
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      periodLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const currency = dto.currency || 'NOR';

    switch (dto.reportType) {
      case ReportType.PROFIT_LOSS:
        return this.generateProfitLossReport(
          dto.orgId,
          startDate,
          endDate,
          currency,
          periodLabel,
          dto.includeComparative,
        );
      case ReportType.BALANCE_SHEET:
        return this.generateBalanceSheetReport(
          dto.orgId,
          endDate,
          currency,
          periodLabel,
          dto.includeComparative,
        );
      case ReportType.CASHFLOW:
        return this.generateCashflowReport(
          dto.orgId,
          startDate,
          endDate,
          currency,
          periodLabel,
        );
      default:
        throw new BadRequestException(`Unknown report type: ${dto.reportType}`);
    }
  }

  /**
   * Generate Profit & Loss (Income Statement) report
   */
  private async generateProfitLossReport(
    orgId: string,
    startDate: Date,
    endDate: Date,
    currency: string,
    periodLabel: string,
    includeComparative?: boolean,
  ): Promise<any> {
    // Get all journal entries for the period
    const entries = await this.entryRepository.find({
      where: {
        orgId,
        occurredAt: Between(startDate, endDate),
        status: JournalEntryStatus.POSTED,
      },
      relations: ['lines', 'lines.account'],
    });

    // Get income and expense accounts
    const incomeAccounts = await this.accountRepository.find({
      where: {
        orgId,
        type: AccountType.INCOME,
        status: AccountStatus.ACTIVE,
      },
    });

    const expenseAccounts = await this.accountRepository.find({
      where: {
        orgId,
        type: AccountType.EXPENSE,
        status: AccountStatus.ACTIVE,
      },
    });

    // Calculate income
    const income = this.calculateAccountBalances(
      entries,
      incomeAccounts.map((a) => a.id),
      currency,
    );

    // Calculate expenses
    const expenses = this.calculateAccountBalances(
      entries,
      expenseAccounts.map((a) => a.id),
      currency,
    );

    const totalIncome = income.reduce(
      (sum, item) => sum + parseFloat(item.balance),
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, item) => sum + parseFloat(item.balance),
      0,
    );
    const netProfit = totalIncome - totalExpenses;

    const report: any = {
      reportType: 'profit_loss',
      period: periodLabel,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currency,
      income: {
        items: income,
        total: totalIncome.toFixed(2),
      },
      expenses: {
        items: expenses,
        total: totalExpenses.toFixed(2),
      },
      netProfit: netProfit.toFixed(2),
      netProfitPercentage:
        totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : '0.00',
    };

    // Add comparative period if requested
    if (includeComparative) {
      const comparativeStart = new Date(startDate);
      const comparativeEnd = new Date(endDate);
      const periodDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      comparativeStart.setDate(comparativeStart.getDate() - periodDays);
      comparativeEnd.setTime(
        comparativeStart.getTime() + (endDate.getTime() - startDate.getTime()),
      );

      const comparativeEntries = await this.entryRepository.find({
        where: {
          orgId,
          occurredAt: Between(comparativeStart, comparativeEnd),
          status: JournalEntryStatus.POSTED,
        },
        relations: ['lines', 'lines.account'],
      });

      const comparativeIncome = this.calculateAccountBalances(
        comparativeEntries,
        incomeAccounts.map((a) => a.id),
        currency,
      );
      const comparativeExpenses = this.calculateAccountBalances(
        comparativeEntries,
        expenseAccounts.map((a) => a.id),
        currency,
      );

      const comparativeTotalIncome = comparativeIncome.reduce(
        (sum, item) => sum + parseFloat(item.balance),
        0,
      );
      const comparativeTotalExpenses = comparativeExpenses.reduce(
        (sum, item) => sum + parseFloat(item.balance),
        0,
      );
      const comparativeNetProfit =
        comparativeTotalIncome - comparativeTotalExpenses;

      report.comparative = {
        period: `${comparativeStart.toISOString().split('T')[0]} to ${comparativeEnd.toISOString().split('T')[0]}`,
        income: {
          items: comparativeIncome,
          total: comparativeTotalIncome.toFixed(2),
        },
        expenses: {
          items: comparativeExpenses,
          total: comparativeTotalExpenses.toFixed(2),
        },
        netProfit: comparativeNetProfit.toFixed(2),
        variance: {
          income: (totalIncome - comparativeTotalIncome).toFixed(2),
          expenses: (totalExpenses - comparativeTotalExpenses).toFixed(2),
          netProfit: (netProfit - comparativeNetProfit).toFixed(2),
        },
      };
    }

    return report;
  }

  /**
   * Generate Balance Sheet report
   */
  private async generateBalanceSheetReport(
    orgId: string,
    asOfDate: Date,
    currency: string,
    periodLabel: string,
    includeComparative?: boolean,
  ): Promise<any> {
    // Get all accounts
    const accounts = await this.accountRepository.find({
      where: {
        orgId,
        status: AccountStatus.ACTIVE,
      },
    });

    // Get all journal entries up to the date
    const entries = await this.entryRepository.find({
      where: {
        orgId,
        occurredAt: LessThanOrEqual(asOfDate),
        status: JournalEntryStatus.POSTED,
      },
      relations: ['lines', 'lines.account'],
    });

    // Group accounts by type
    const assets = accounts.filter((a) => a.type === AccountType.ASSET);
    const liabilities = accounts.filter(
      (a) => a.type === AccountType.LIABILITY,
    );
    const equity = accounts.filter((a) => a.type === AccountType.EQUITY);

    // Calculate balances
    const assetBalances = this.calculateAccountBalances(
      entries,
      assets.map((a) => a.id),
      currency,
    );
    const liabilityBalances = this.calculateAccountBalances(
      entries,
      liabilities.map((a) => a.id),
      currency,
    );
    const equityBalances = this.calculateAccountBalances(
      entries,
      equity.map((a) => a.id),
      currency,
    );

    const totalAssets = assetBalances.reduce(
      (sum, item) => sum + parseFloat(item.balance),
      0,
    );
    const totalLiabilities = liabilityBalances.reduce(
      (sum, item) => sum + parseFloat(item.balance),
      0,
    );
    const totalEquity = equityBalances.reduce(
      (sum, item) => sum + parseFloat(item.balance),
      0,
    );

    const report: any = {
      reportType: 'balance_sheet',
      period: periodLabel,
      asOfDate: asOfDate.toISOString(),
      currency,
      assets: {
        items: assetBalances,
        total: totalAssets.toFixed(2),
      },
      liabilities: {
        items: liabilityBalances,
        total: totalLiabilities.toFixed(2),
      },
      equity: {
        items: equityBalances,
        total: totalEquity.toFixed(2),
      },
      totalLiabilitiesAndEquity: (totalLiabilities + totalEquity).toFixed(2),
      balance: (
        Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
      ).toString(), // Should balance
    };

    // Add comparative if requested
    if (includeComparative) {
      const comparativeDate = new Date(asOfDate);
      comparativeDate.setFullYear(comparativeDate.getFullYear() - 1);

      const comparativeEntries = await this.entryRepository.find({
        where: {
          orgId,
          occurredAt: LessThanOrEqual(comparativeDate),
          status: JournalEntryStatus.POSTED,
        },
        relations: ['lines', 'lines.account'],
      });

      const comparativeAssetBalances = this.calculateAccountBalances(
        comparativeEntries,
        assets.map((a) => a.id),
        currency,
      );
      const comparativeLiabilityBalances = this.calculateAccountBalances(
        comparativeEntries,
        liabilities.map((a) => a.id),
        currency,
      );
      const comparativeEquityBalances = this.calculateAccountBalances(
        comparativeEntries,
        equity.map((a) => a.id),
        currency,
      );

      const comparativeTotalAssets = comparativeAssetBalances.reduce(
        (sum, item) => sum + parseFloat(item.balance),
        0,
      );
      const comparativeTotalLiabilities = comparativeLiabilityBalances.reduce(
        (sum, item) => sum + parseFloat(item.balance),
        0,
      );
      const comparativeTotalEquity = comparativeEquityBalances.reduce(
        (sum, item) => sum + parseFloat(item.balance),
        0,
      );

      report.comparative = {
        asOfDate: comparativeDate.toISOString(),
        assets: {
          items: comparativeAssetBalances,
          total: comparativeTotalAssets.toFixed(2),
        },
        liabilities: {
          items: comparativeLiabilityBalances,
          total: comparativeTotalLiabilities.toFixed(2),
        },
        equity: {
          items: comparativeEquityBalances,
          total: comparativeTotalEquity.toFixed(2),
        },
        variance: {
          assets: (totalAssets - comparativeTotalAssets).toFixed(2),
          liabilities: (totalLiabilities - comparativeTotalLiabilities).toFixed(
            2,
          ),
          equity: (totalEquity - comparativeTotalEquity).toFixed(2),
        },
      };
    }

    return report;
  }

  /**
   * Generate Cashflow report
   */
  private async generateCashflowReport(
    orgId: string,
    startDate: Date,
    endDate: Date,
    currency: string,
    periodLabel: string,
  ): Promise<any> {
    // Get all journal entries for the period
    const entries = await this.entryRepository.find({
      where: {
        orgId,
        occurredAt: Between(startDate, endDate),
        status: JournalEntryStatus.POSTED,
      },
      relations: ['lines', 'lines.account'],
    });

    // Get cash accounts (typically asset accounts with code starting with 1xxx)
    const cashAccounts = await this.accountRepository.find({
      where: {
        orgId,
        type: AccountType.ASSET,
        status: AccountStatus.ACTIVE,
      },
    });

    // Filter for cash accounts (simplified - in production, use account tags or metadata)
    const cashAccountIds = cashAccounts
      .filter((a) => a.code.startsWith('1'))
      .map((a) => a.id);

    // Calculate operating activities (income/expense accounts)
    const incomeAccounts = await this.accountRepository.find({
      where: {
        orgId,
        type: AccountType.INCOME,
        status: AccountStatus.ACTIVE,
      },
    });

    const expenseAccounts = await this.accountRepository.find({
      where: {
        orgId,
        type: AccountType.EXPENSE,
        status: AccountStatus.ACTIVE,
      },
    });

    // Calculate cash from operations
    const operatingCash = this.calculateCashflowFromEntries(
      entries,
      [...incomeAccounts.map((a) => a.id), ...expenseAccounts.map((a) => a.id)],
      cashAccountIds,
      currency,
    );

    // Calculate investing activities (asset purchases/sales)
    const investingCash = this.calculateCashflowFromEntries(
      entries,
      cashAccounts.filter((a) => !a.code.startsWith('1')).map((a) => a.id), // Non-cash assets
      cashAccountIds,
      currency,
    );

    // Calculate financing activities (liability/equity changes)
    const liabilityAccounts = await this.accountRepository.find({
      where: {
        orgId,
        type: AccountType.LIABILITY,
        status: AccountStatus.ACTIVE,
      },
    });

    const equityAccounts = await this.accountRepository.find({
      where: {
        orgId,
        type: AccountType.EQUITY,
        status: AccountStatus.ACTIVE,
      },
    });

    const financingCash = this.calculateCashflowFromEntries(
      entries,
      [
        ...liabilityAccounts.map((a) => a.id),
        ...equityAccounts.map((a) => a.id),
      ],
      cashAccountIds,
      currency,
    );

    const netCashFlow = operatingCash + investingCash + financingCash;

    // Get opening balance
    const openingEntries = await this.entryRepository.find({
      where: {
        orgId,
        occurredAt: LessThanOrEqual(startDate),
        status: JournalEntryStatus.POSTED,
      },
      relations: ['lines', 'lines.account'],
    });

    const openingBalance = this.calculateAccountBalances(
      openingEntries,
      cashAccountIds,
      currency,
    ).reduce((sum, item) => sum + parseFloat(item.balance), 0);

    const closingBalance = openingBalance + netCashFlow;

    return {
      reportType: 'cashflow',
      period: periodLabel,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currency,
      operatingActivities: {
        cashFlow: operatingCash.toFixed(2),
        description: 'Cash from operations',
      },
      investingActivities: {
        cashFlow: investingCash.toFixed(2),
        description: 'Cash from investing',
      },
      financingActivities: {
        cashFlow: financingCash.toFixed(2),
        description: 'Cash from financing',
      },
      netCashFlow: netCashFlow.toFixed(2),
      openingBalance: openingBalance.toFixed(2),
      closingBalance: closingBalance.toFixed(2),
    };
  }

  /**
   * Calculate account balances from journal entries
   */
  private calculateAccountBalances(
    entries: JournalEntry[],
    accountIds: string[],
    currency: string,
  ): Array<{ accountCode: string; accountName: string; balance: string }> {
    const balances = new Map<
      string,
      { code: string; name: string; debit: number; credit: number }
    >();

    entries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (accountIds.includes(line.accountId) && line.currency === currency) {
          const account = line.account;
          if (!account) return;

          const existing = balances.get(line.accountId) || {
            code: account.code,
            name: account.name,
            debit: 0,
            credit: 0,
          };

          if (line.direction === LineDirection.DEBIT) {
            existing.debit += parseFloat(line.amountNative);
          } else {
            existing.credit += parseFloat(line.amountNative);
          }

          balances.set(line.accountId, existing);
        }
      });
    });

    // Calculate net balance (debit - credit for assets/expenses, credit - debit for liabilities/equity/income)
    return Array.from(balances.values()).map((item) => {
      // Simplified: assume all accounts are debit-normal (assets/expenses)
      // In production, determine based on account type
      const balance = item.debit - item.credit;
      return {
        accountCode: item.code,
        accountName: item.name,
        balance: balance.toFixed(2),
      };
    });
  }

  /**
   * Calculate cashflow from entries
   */
  private calculateCashflowFromEntries(
    entries: JournalEntry[],
    relatedAccountIds: string[],
    cashAccountIds: string[],
    currency: string,
  ): number {
    let cashFlow = 0;

    entries.forEach((entry) => {
      const hasRelatedAccount = entry.lines.some((line) =>
        relatedAccountIds.includes(line.accountId),
      );
      const hasCashAccount = entry.lines.some((line) =>
        cashAccountIds.includes(line.accountId),
      );

      if (hasRelatedAccount && hasCashAccount) {
        entry.lines.forEach((line) => {
          if (
            cashAccountIds.includes(line.accountId) &&
            line.currency === currency
          ) {
            if (line.direction === LineDirection.DEBIT) {
              cashFlow += parseFloat(line.amountNative);
            } else {
              cashFlow -= parseFloat(line.amountNative);
            }
          }
        });
      }
    });

    return cashFlow;
  }

  /**
   * Create a reconciliation
   */
  async createReconciliation(
    dto: CreateReconciliationDto,
    userId: string,
  ): Promise<Reconciliation> {
    // Validate account if provided
    if (dto.accountCode) {
      const account = await this.accountRepository.findOne({
        where: { orgId: dto.orgId, code: dto.accountCode },
      });

      if (!account) {
        throw new NotFoundException(
          `Account ${dto.accountCode} not found for organization`,
        );
      }
    }

    const reconciliation = this.reconciliationRepository.create({
      ...dto,
      status: ReconciliationStatus.PENDING,
      openingBalance: dto.openingBalance || '0',
      closingBalance: dto.closingBalance || '0',
      ledgerTotal: '0',
      externalTotal: '0',
      difference: '0',
    });

    const saved = await this.reconciliationRepository.save(reconciliation);

    this.logger.log(`Created reconciliation: ${saved.id} for org ${dto.orgId}`);
    this.eventEmitter.emit('reconciliation.created', {
      reconciliationId: saved.id,
      orgId: dto.orgId,
      type: dto.type,
    });

    return saved;
  }

  /**
   * Get reconciliation by ID
   */
  async getReconciliation(
    reconciliationId: string,
    orgId: string,
  ): Promise<Reconciliation> {
    const reconciliation = await this.reconciliationRepository.findOne({
      where: { id: reconciliationId, orgId },
      relations: ['matches'],
    });

    if (!reconciliation) {
      throw new NotFoundException(
        `Reconciliation ${reconciliationId} not found`,
      );
    }

    return reconciliation;
  }

  /**
   * List reconciliations for an organization
   */
  async listReconciliations(
    orgId: string,
    type?: ReconciliationType,
    status?: ReconciliationStatus,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ reconciliations: Reconciliation[]; total: number }> {
    const where: any = { orgId };
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }

    const [reconciliations, total] =
      await this.reconciliationRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });

    return { reconciliations, total };
  }

  /**
   * Match a transaction (ledger entry with external transaction)
   */
  async matchTransaction(
    dto: MatchTransactionDto,
    userId: string,
  ): Promise<ReconciliationMatch> {
    // Verify reconciliation exists
    const reconciliation = await this.reconciliationRepository.findOne({
      where: { id: dto.reconciliationId },
    });

    if (!reconciliation) {
      throw new NotFoundException(
        `Reconciliation ${dto.reconciliationId} not found`,
      );
    }

    // Verify ledger entry if provided
    if (dto.ledgerEntryId) {
      const entry = await this.entryRepository.findOne({
        where: { id: dto.ledgerEntryId, orgId: reconciliation.orgId },
      });

      if (!entry) {
        throw new NotFoundException(
          `Journal entry ${dto.ledgerEntryId} not found`,
        );
      }
    }

    const match = this.reconciliationMatchRepository.create({
      ...dto,
      transactionDate: new Date(dto.transactionDate),
      matchType: dto.matchType || MatchType.EXACT,
    });

    const saved = await this.reconciliationMatchRepository.save(match);

    // Update reconciliation statistics
    await this.updateReconciliationStats(dto.reconciliationId);

    this.logger.log(
      `Matched transaction: ${saved.id} for reconciliation ${dto.reconciliationId}`,
    );

    return saved;
  }

  /**
   * Update reconciliation statistics
   */
  private async updateReconciliationStats(
    reconciliationId: string,
  ): Promise<void> {
    const reconciliation = await this.reconciliationRepository.findOne({
      where: { id: reconciliationId },
    });

    if (!reconciliation) {
      return;
    }

    // Get all matches
    const matches = await this.reconciliationMatchRepository.find({
      where: { reconciliationId },
    });

    // Calculate totals
    const ledgerTotal = matches
      .filter((m) => m.ledgerEntryId)
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const externalTotal = matches
      .filter((m) => m.externalTransactionId)
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const difference = ledgerTotal - externalTotal;

    // Count matches
    const matchedCount = matches.length;

    // Update reconciliation
    reconciliation.ledgerTotal = ledgerTotal.toFixed(18);
    reconciliation.externalTotal = externalTotal.toFixed(18);
    reconciliation.difference = difference.toFixed(18);
    reconciliation.matchedCount = matchedCount;

    // Update status based on difference
    if (Math.abs(parseFloat(reconciliation.difference)) < 0.01) {
      reconciliation.status = ReconciliationStatus.COMPLETED;
    } else if (matchedCount > 0) {
      reconciliation.status = ReconciliationStatus.PARTIAL;
    }

    await this.reconciliationRepository.save(reconciliation);
  }

  /**
   * Auto-match transactions using fuzzy matching
   */
  async autoMatchTransactions(
    reconciliationId: string,
    orgId: string,
  ): Promise<{ matched: number; unmatched: number }> {
    const reconciliation = await this.reconciliationRepository.findOne({
      where: { id: reconciliationId, orgId },
    });

    if (!reconciliation) {
      throw new NotFoundException(
        `Reconciliation ${reconciliationId} not found`,
      );
    }

    // Get ledger entries for the period
    const ledgerEntries = await this.entryRepository.find({
      where: {
        orgId,
        occurredAt: Between(reconciliation.startDate, reconciliation.endDate),
        status: JournalEntryStatus.POSTED,
      },
      relations: ['lines'],
    });

    // Get existing matches to avoid duplicates
    const existingMatches = await this.reconciliationMatchRepository.find({
      where: { reconciliationId },
    });

    const matchedLedgerIds = new Set(
      existingMatches
        .map((m) => m.ledgerEntryId)
        .filter((id) => id !== undefined),
    );

    // Filter out already matched entries
    const unmatchedEntries = ledgerEntries.filter(
      (entry) => !matchedLedgerIds.has(entry.id),
    );

    let matched = 0;
    let unmatched = unmatchedEntries.length;

    // Simple auto-matching: create matches for all unmatched entries
    // In production, this would use ML/fuzzy matching with external data
    for (const entry of unmatchedEntries) {
      const totalAmount = entry.lines.reduce((sum, line) => {
        const amount = parseFloat(line.amountNative);
        return (
          sum + (line.direction === LineDirection.DEBIT ? amount : -amount)
        );
      }, 0);

      if (Math.abs(totalAmount) > 0.0001) {
        // Only match non-zero entries
        const match = this.reconciliationMatchRepository.create({
          reconciliationId,
          ledgerEntryId: entry.id,
          amount: Math.abs(totalAmount).toFixed(18),
          transactionDate: entry.occurredAt,
          matchType: MatchType.EXACT,
          confidenceScore: 100,
        });

        await this.reconciliationMatchRepository.save(match);
        matched++;
        unmatched--;
      }
    }

    // Update reconciliation stats
    await this.updateReconciliationStats(reconciliationId);

    return { matched, unmatched };
  }

  /**
   * Get reconciliation details with matches
   */
  async getReconciliationDetails(
    reconciliationId: string,
    orgId: string,
  ): Promise<{
    reconciliation: Reconciliation;
    matches: ReconciliationMatch[];
    unmatchedLedger: JournalEntry[];
    unmatchedExternal: any[];
  }> {
    const reconciliation = await this.getReconciliation(
      reconciliationId,
      orgId,
    );

    // Get all matches
    const matches = await this.reconciliationMatchRepository.find({
      where: { reconciliationId },
      order: { transactionDate: 'ASC' },
    });

    // Get unmatched ledger entries
    const matchedLedgerIds = new Set(
      matches
        .map((m) => m.ledgerEntryId)
        .filter((id) => id !== undefined) as string[],
    );

    const allLedgerEntries = await this.entryRepository.find({
      where: {
        orgId,
        occurredAt: Between(reconciliation.startDate, reconciliation.endDate),
        status: JournalEntryStatus.POSTED,
      },
      relations: ['lines'],
    });

    const unmatchedLedger = allLedgerEntries.filter(
      (entry) => !matchedLedgerIds.has(entry.id),
    );

    // Unmatched external transactions (would come from external API in production)
    const unmatchedExternal: any[] = [];

    return {
      reconciliation,
      matches,
      unmatchedLedger,
      unmatchedExternal,
    };
  }
}
