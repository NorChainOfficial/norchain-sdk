import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { LedgerService } from './ledger.service';
import { LedgerAccount } from './entities/ledger-account.entity';
import { JournalEntry, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalLine } from './entities/journal-line.entity';
import { PeriodClosure } from './entities/period-closure.entity';
import { Reconciliation } from './entities/reconciliation.entity';
import { ReconciliationMatch } from './entities/reconciliation-match.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { AccountStatus, AccountType } from './entities/ledger-account.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ClosePeriodDto } from './dto/close-period.dto';
import { LineDirection } from './entities/journal-line.entity';
import { CalculateVatDto, VatRate, VatType } from './dto/calculate-vat.dto';
import { GetFinancialReportDto, ReportType, ReportPeriod } from './dto/get-financial-report.dto';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { MatchTransactionDto } from './dto/match-transaction.dto';
import { ReconciliationStatus, ReconciliationType } from './entities/reconciliation.entity';
import { MatchType } from './entities/reconciliation-match.entity';

describe('LedgerService', () => {
  let service: LedgerService;
  let accountRepository: Repository<LedgerAccount>;
  let entryRepository: Repository<JournalEntry>;
  let lineRepository: Repository<JournalLine>;
  let closureRepository: Repository<PeriodClosure>;
  let dataSource: DataSource;
  let eventEmitter: EventEmitter2;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getRawMany: jest.fn(),
  };

  const mockAccountRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockEntryRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLineRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    find: jest.fn(),
  };

  const mockClosureRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockReconciliationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  const mockReconciliationMatchRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTransaction = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((callback) => Promise.resolve(callback(mockTransaction))),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        {
          provide: getRepositoryToken(LedgerAccount),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(JournalEntry),
          useValue: mockEntryRepository,
        },
        {
          provide: getRepositoryToken(JournalLine),
          useValue: mockLineRepository,
        },
        {
          provide: getRepositoryToken(PeriodClosure),
          useValue: mockClosureRepository,
        },
        {
          provide: getRepositoryToken(Reconciliation),
          useValue: mockReconciliationRepository,
        },
        {
          provide: getRepositoryToken(ReconciliationMatch),
          useValue: mockReconciliationMatchRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
    accountRepository = module.get<Repository<LedgerAccount>>(
      getRepositoryToken(LedgerAccount),
    );
    entryRepository = module.get<Repository<JournalEntry>>(
      getRepositoryToken(JournalEntry),
    );
    lineRepository = module.get<Repository<JournalLine>>(
      getRepositoryToken(JournalLine),
    );
    closureRepository = module.get<Repository<PeriodClosure>>(
      getRepositoryToken(PeriodClosure),
    );
    dataSource = module.get<DataSource>(DataSource);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const dto = {
        code: '1100',
        name: 'User NOR Cash',
        type: 'asset' as any,
        currency: 'NOR',
        orgId: 'org_123',
      };

      const mockAccount = { id: 'acc_123', ...dto, status: AccountStatus.ACTIVE };
      mockAccountRepository.findOne.mockResolvedValue(null);
      mockAccountRepository.create.mockReturnValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(mockAccount);

      const result = await service.createAccount(dto, 'user_123');

      expect(result).toEqual(mockAccount);
      expect(mockAccountRepository.create).toHaveBeenCalled();
      expect(mockAccountRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if account code already exists', async () => {
      const dto = {
        code: '1100',
        name: 'User NOR Cash',
        type: 'asset' as any,
        currency: 'NOR',
        orgId: 'org_123',
      };

      mockAccountRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.createAccount(dto, 'user_123')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should validate parent account exists', async () => {
      const dto = {
        code: '1101',
        name: 'Sub Account',
        type: 'asset' as any,
        currency: 'NOR',
        orgId: 'org_123',
        parentId: 'parent_123',
      };

      mockAccountRepository.findOne
        .mockResolvedValueOnce(null) // No existing account with code
        .mockResolvedValueOnce({ id: 'parent_123' }); // Parent exists

      const mockAccount = { id: 'acc_123', ...dto, status: AccountStatus.ACTIVE };
      mockAccountRepository.create.mockReturnValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(mockAccount);

      await service.createAccount(dto, 'user_123');

      expect(mockAccountRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if parent account does not exist', async () => {
      const dto = {
        code: '1101',
        name: 'Sub Account',
        type: 'asset' as any,
        currency: 'NOR',
        orgId: 'org_123',
        parentId: 'parent_123',
      };

      mockAccountRepository.findOne
        .mockResolvedValueOnce(null) // No existing account with code
        .mockResolvedValueOnce(null); // Parent does not exist

      await expect(service.createAccount(dto, 'user_123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listAccounts', () => {
    it('should list all accounts for an organization', async () => {
      const mockAccounts = [
        { id: 'acc_1', code: '1100', name: 'Account 1', orgId: 'org_123' },
        { id: 'acc_2', code: '1200', name: 'Account 2', orgId: 'org_123' },
      ];

      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.listAccounts('org_123');

      expect(result).toEqual(mockAccounts);
      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { orgId: 'org_123' },
        relations: ['parent', 'children'],
        order: { code: 'ASC' },
      });
    });

    it('should filter by status when provided', async () => {
      const mockAccounts = [
        { id: 'acc_1', code: '1100', name: 'Account 1', status: AccountStatus.ACTIVE },
      ];

      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.listAccounts('org_123', AccountStatus.ACTIVE);

      expect(result).toEqual(mockAccounts);
      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { orgId: 'org_123', status: AccountStatus.ACTIVE },
        relations: ['parent', 'children'],
        order: { code: 'ASC' },
      });
    });
  });

  describe('getAccount', () => {
    it('should return account by ID', async () => {
      const mockAccount = { id: 'acc_123', code: '1100', name: 'Account', orgId: 'org_123' };
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.getAccount('acc_123', 'org_123');

      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.getAccount('acc_123', 'org_123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createJournalEntry', () => {
    it('should create journal entry successfully', async () => {
      const dto: CreateJournalEntryDto = {
        orgId: 'org_123',
        eventType: 'payment.succeeded',
        eventId: 'evt_123',
        occurredAt: new Date().toISOString(),
        period: '2025-01',
        memo: 'Test entry',
        lines: [
          { account: '1100', currency: 'NOR', amount: '100.00', direction: LineDirection.DEBIT },
          { account: '4000', currency: 'NOR', amount: '100.00', direction: LineDirection.CREDIT },
        ],
      };

      mockEntryRepository.findOne.mockResolvedValue(null);
      mockClosureRepository.findOne.mockResolvedValue(null);
      mockQueryBuilder.getOne.mockResolvedValue({ id: 'acc_1100' });
      mockQueryBuilder.getMany.mockResolvedValue([
        { id: 'acc_1100', code: '1100' },
        { id: 'acc_4000', code: '4000' },
      ]);

      const mockEntry = { id: 'entry_123', ...dto };
      mockTransaction.create.mockReturnValue(mockEntry);
      mockTransaction.save.mockResolvedValue(mockEntry);

      const result = await service.createJournalEntry(dto, 'user_123');

      expect(result).toBeDefined();
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should return existing entry if idempotent', async () => {
      const dto: CreateJournalEntryDto = {
        orgId: 'org_123',
        eventType: 'payment.succeeded',
        eventId: 'evt_123',
        occurredAt: new Date().toISOString(),
        period: '2025-01',
        memo: 'Test entry',
        lines: [],
      };

      const existingEntry = { id: 'entry_123', ...dto };
      mockEntryRepository.findOne.mockResolvedValue(existingEntry);

      const result = await service.createJournalEntry(dto, 'user_123');

      expect(result).toEqual(existingEntry);
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if period is locked', async () => {
      const dto: CreateJournalEntryDto = {
        orgId: 'org_123',
        eventType: 'payment.succeeded',
        eventId: 'evt_123',
        occurredAt: new Date().toISOString(),
        period: '2025-01',
        memo: 'Test entry',
        lines: [],
      };

      mockEntryRepository.findOne.mockResolvedValue(null);
      mockClosureRepository.findOne.mockResolvedValue({ period: '2025-01' });

      await expect(service.createJournalEntry(dto, 'user_123')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if double-entry validation fails', async () => {
      const dto: CreateJournalEntryDto = {
        orgId: 'org_123',
        eventType: 'payment.succeeded',
        eventId: 'evt_123',
        occurredAt: new Date().toISOString(),
        period: '2025-01',
        memo: 'Test entry',
        lines: [
          { account: '1100', currency: 'NOR', amount: '100.00', direction: LineDirection.DEBIT },
          { account: '4000', currency: 'NOR', amount: '50.00', direction: LineDirection.CREDIT },
        ],
      };

      mockEntryRepository.findOne.mockResolvedValue(null);
      mockClosureRepository.findOne.mockResolvedValue(null);

      await expect(service.createJournalEntry(dto, 'user_123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getJournalEntry', () => {
    it('should return journal entry by ID', async () => {
      const mockEntry = { id: 'entry_123', orgId: 'org_123' };
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);

      const result = await service.getJournalEntry('entry_123', 'org_123');

      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException if entry not found', async () => {
      mockEntryRepository.findOne.mockResolvedValue(null);

      await expect(service.getJournalEntry('entry_123', 'org_123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAccountStatement', () => {
    it('should return account statement', async () => {
      const mockAccount = { id: 'acc_123', code: '1100', name: 'Account', orgId: 'org_123' };
      const mockLines = [
        { id: 'line_1', accountId: 'acc_123', amount: '100.00', direction: LineDirection.DEBIT, entry: { occurredAt: new Date() } },
        { id: 'line_2', accountId: 'acc_123', amount: '50.00', direction: LineDirection.CREDIT, entry: { occurredAt: new Date() } },
      ];

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockQueryBuilder.getMany.mockResolvedValue(mockLines);

      const result = await service.getAccountStatement('acc_123', 'org_123');

      expect(result).toBeDefined();
      expect(result.account).toEqual(mockAccount);
      expect(result.movements).toBeDefined();
      expect(mockLineRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should throw NotFoundException if account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.getAccountStatement('acc_123', 'org_123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('closePeriod', () => {
    it('should close period successfully', async () => {
      const dto: ClosePeriodDto = {
        orgId: 'org_123',
        period: '2025-01',
      };

      mockClosureRepository.findOne.mockResolvedValue(null);
      mockEntryRepository.find.mockResolvedValue([
        { id: 'entry_1', lines: [] },
      ]);

      const mockClosure = { id: 'closure_123', period: '2025-01', merkleRoot: '0xabc' };
      mockClosureRepository.create.mockReturnValue(mockClosure);
      mockClosureRepository.save.mockResolvedValue(mockClosure);

      const result = await service.closePeriod(dto, 'user_123');

      expect(result).toBeDefined();
      expect(mockClosureRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if period already closed', async () => {
      const dto: ClosePeriodDto = {
        orgId: 'org_123',
        period: '2025-01',
      };

      mockClosureRepository.findOne.mockResolvedValue({ period: '2025-01' });

      await expect(service.closePeriod(dto, 'user_123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getPeriodClosure', () => {
    it('should return period closure', async () => {
      const mockClosure = { id: 'closure_123', period: '2025-01' };
      mockClosureRepository.findOne.mockResolvedValue(mockClosure);

      const result = await service.getPeriodClosure('org_123', '2025-01');

      expect(result).toEqual(mockClosure);
    });

    it('should throw NotFoundException if closure not found', async () => {
      mockClosureRepository.findOne.mockResolvedValue(null);

      await expect(service.getPeriodClosure('org_123', '2025-01')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateDoubleEntry', () => {
    it('should validate balanced entries', () => {
      const lines = [
        { account: '1100', currency: 'NOR', amount: '100.00', direction: LineDirection.DEBIT },
        { account: '4000', currency: 'NOR', amount: '100.00', direction: LineDirection.CREDIT },
      ];

      const result = (service as any).validateDoubleEntry(lines);

      expect(result.valid).toBe(true);
    });

    it('should reject unbalanced entries', () => {
      const lines = [
        { account: '1100', currency: 'NOR', amount: '100.00', direction: LineDirection.DEBIT },
        { account: '4000', currency: 'NOR', amount: '50.00', direction: LineDirection.CREDIT },
      ];

      const result = (service as any).validateDoubleEntry(lines);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Double-entry validation failed');
    });

    it('should validate per currency', () => {
      const lines = [
        { account: '1100', currency: 'NOR', amount: '100.00', direction: LineDirection.DEBIT },
        { account: '1200', currency: 'USDT', amount: '100.00', direction: LineDirection.CREDIT },
      ];

      const result = (service as any).validateDoubleEntry(lines);

      expect(result.valid).toBe(false);
      // The error message format is "Double-entry validation failed for {currency}: debits={debit}, credits={credit}"
      expect(result.error).toContain('Double-entry validation failed');
    });
  });

  describe('resolveAccountIds', () => {
    it('should resolve account IDs from codes', async () => {
      const lines = [
        { account: '1100', currency: 'NOR', amount: '100.00', direction: LineDirection.DEBIT },
        { account: '4000', currency: 'NOR', amount: '100.00', direction: LineDirection.CREDIT },
      ];

      // Mock the query builder to return accounts
      mockAccountRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([
        { id: 'acc_1100', code: '1100' },
        { id: 'acc_4000', code: '4000' },
      ]);

      const result = await (service as any).resolveAccountIds('org_123', lines);

      expect(result).toHaveLength(2);
      expect(result[0].accountId).toBe('acc_1100');
      expect(result[1].accountId).toBe('acc_4000');
    });

    it('should throw NotFoundException if account code not found', async () => {
      const lines = [
        { account: '9999', currency: 'NOR', amount: '100.00', direction: LineDirection.DEBIT },
      ];

      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        (service as any).resolveAccountIds('org_123', lines),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateNativeAmount', () => {
    it('should calculate native amount with FX rate', () => {
      const result = (service as any).calculateNativeAmount('100.00', '1.5');

      // parseFloat('100.00') * parseFloat('1.5') = 150, toString() = '150'
      expect(result).toBe('150');
    });

    it('should return same amount if no FX rate', () => {
      const result = (service as any).calculateNativeAmount('100.00', undefined);
      expect(result).toBe('100.00');
    });

    it('should handle zero amount', () => {
      const result = (service as any).calculateNativeAmount('0', '1.5');
      expect(result).toBe('0');
    });

    it('should handle negative FX rate', () => {
      const result = (service as any).calculateNativeAmount('100.00', '-1.5');
      expect(result).toBe('-150');
    });
  });

  describe('getAccountStatement', () => {
    it('should return statement with date range', async () => {
      const accountId = 'account-123';
      const orgId = 'org-123';
      const fromDate = new Date('2025-01-01');
      const toDate = new Date('2025-01-31');

      const mockAccount = {
        id: accountId,
        code: '1000',
        name: 'Cash',
        orgId,
      };

      const mockLines = [
        {
          id: 'line-1',
          accountId,
          amount: '100.00',
          direction: LineDirection.DEBIT,
          currency: 'NOR',
          entry: { occurredAt: new Date('2025-01-15'), createdAt: new Date() },
        },
        {
          id: 'line-2',
          accountId,
          amount: '50.00',
          direction: LineDirection.CREDIT,
          currency: 'NOR',
          entry: { occurredAt: new Date('2025-01-20'), createdAt: new Date() },
        },
      ];

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockLineRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getMany: jest.fn().mockResolvedValue(mockLines),
      });

      const result = await service.getAccountStatement(
        accountId,
        orgId,
        fromDate,
        toDate,
      );

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('movements');
      expect(result).toHaveProperty('finalBalance');
      expect(result.fromDate).toEqual(fromDate);
      expect(result.toDate).toEqual(toDate);
    });

    it('should return statement without date range', async () => {
      const accountId = 'account-123';
      const orgId = 'org-123';

      const mockAccount = {
        id: accountId,
        code: '1000',
        name: 'Cash',
        orgId,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockLineRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getAccountStatement(accountId, orgId);

      expect(result).toHaveProperty('account');
      expect(result.fromDate).toBeNull();
      expect(result.toDate).toBeNull();
      expect(result.movements).toHaveLength(0);
    });

    it('should calculate running balance correctly', async () => {
      const accountId = 'account-123';
      const orgId = 'org-123';

      const mockAccount = {
        id: accountId,
        code: '1000',
        name: 'Cash',
        orgId,
      };

      const mockLines = [
        {
          id: 'line-1',
          accountId,
          amount: '100.00',
          direction: LineDirection.DEBIT,
          currency: 'NOR',
          entry: { occurredAt: new Date(), createdAt: new Date() },
        },
        {
          id: 'line-2',
          accountId,
          amount: '30.00',
          direction: LineDirection.CREDIT,
          currency: 'NOR',
          entry: { occurredAt: new Date(), createdAt: new Date() },
        },
      ];

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockLineRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getMany: jest.fn().mockResolvedValue(mockLines),
      });

      const result = await service.getAccountStatement(accountId, orgId);

      expect(result.movements).toHaveLength(2);
      expect(result.movements[0]).toHaveProperty('runningBalance');
      expect(result.movements[1]).toHaveProperty('runningBalance');
      expect(result.finalBalance).toBeDefined();
    });
  });

  describe('resolveAccountIds', () => {
    it('should resolve account IDs from UUIDs', async () => {
      const orgId = 'org-123';
      const accountId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
      const lines = [{ account: accountId, amount: '100', direction: LineDirection.DEBIT, currency: 'NOR' }];

      const mockAccount = { id: accountId, code: '1000', orgId };
      const mockQueryBuilder1 = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]), // First call (by code) returns empty
      };
      const mockQueryBuilder2 = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAccount]), // Second call (by UUID) returns account
      };

      mockAccountRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder1 as any)
        .mockReturnValueOnce(mockQueryBuilder2 as any);

      const result = await (service as any).resolveAccountIds(orgId, lines);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('accountId', accountId);
    });

    it('should handle mixed codes and UUIDs', async () => {
      const orgId = 'org-123';
      const account1 = { id: 'account-1', code: '1000', orgId };
      const account2Id = '550e8400-e29b-41d4-a716-446655440001'; // Valid UUID format
      const account2 = { id: account2Id, code: '2000', orgId };
      const lines = [
        { account: '1000', amount: '100', direction: LineDirection.DEBIT, currency: 'NOR' },
        { account: account2Id, amount: '200', direction: LineDirection.CREDIT, currency: 'NOR' },
      ];

      // Create separate query builders for each call
      const mockQueryBuilder1 = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([account1]), // First call finds by code
      };

      const mockQueryBuilder2 = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([account2]), // Second call finds by UUID
      };

      mockAccountRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder1 as any)
        .mockReturnValueOnce(mockQueryBuilder2 as any);

      const result = await (service as any).resolveAccountIds(orgId, lines);

      expect(result).toHaveLength(2);
      expect(result[0].accountId).toBe(account1.id);
      expect(result[1].accountId).toBe(account2.id);
    });
  });

  describe('getAccountStatement', () => {
    it('should handle empty movements', async () => {
      const accountId = 'account-123';
      const orgId = 'org-123';

      const mockAccount = {
        id: accountId,
        code: '1000',
        name: 'Cash',
        orgId,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockLineRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getAccountStatement(accountId, orgId);

      expect(result.movements).toHaveLength(0);
      expect(result.finalBalance).toBe('0');
    });

    it('should handle debit-only movements', async () => {
      const accountId = 'account-123';
      const orgId = 'org-123';

      const mockAccount = {
        id: accountId,
        code: '1000',
        name: 'Cash',
        orgId,
      };

      const mockLines = [
        {
          id: 'line-1',
          accountId,
          amount: '100.00',
          direction: LineDirection.DEBIT,
          currency: 'NOR',
        },
        {
          id: 'line-2',
          accountId,
          amount: '50.00',
          direction: LineDirection.DEBIT,
          currency: 'NOR',
        },
      ];

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockLineRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getMany: jest.fn().mockResolvedValue(mockLines),
      });

      const result = await service.getAccountStatement(accountId, orgId);

      expect(result.movements).toHaveLength(2);
      // Amount calculation removes decimal: '100.00' -> '10000', '50.00' -> '5000', total = '15000'
      expect(result.finalBalance).toBe('15000');
    });

    it('should handle credit-only movements', async () => {
      const accountId = 'account-123';
      const orgId = 'org-123';

      const mockAccount = {
        id: accountId,
        code: '1000',
        name: 'Cash',
        orgId,
      };

      const mockLines = [
        {
          id: 'line-1',
          accountId,
          amount: '100.00',
          direction: LineDirection.CREDIT,
          currency: 'NOR',
        },
      ];

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockLineRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getMany: jest.fn().mockResolvedValue(mockLines),
      });

      const result = await service.getAccountStatement(accountId, orgId);

      expect(result.movements).toHaveLength(1);
      // Credit reduces balance (assuming starting balance is 0)
      expect(parseInt(result.finalBalance)).toBeLessThan(0);
    });

    it('should handle mixed debit and credit movements', async () => {
      const accountId = 'account-123';
      const orgId = 'org-123';

      const mockAccount = {
        id: accountId,
        code: '1000',
        name: 'Cash',
        orgId,
      };

      const mockLines = [
        {
          id: 'line-1',
          accountId,
          amount: '100.00',
          direction: LineDirection.DEBIT,
          currency: 'NOR',
        },
        {
          id: 'line-2',
          accountId,
          amount: '50.00',
          direction: LineDirection.CREDIT,
          currency: 'NOR',
        },
      ];

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockLineRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getMany: jest.fn().mockResolvedValue(mockLines),
      });

      const result = await service.getAccountStatement(accountId, orgId);

      expect(result.movements).toHaveLength(2);
      expect(result.movements[0]).toHaveProperty('runningBalance');
      expect(result.movements[1]).toHaveProperty('runningBalance');
    });
  });

  describe('closePeriod', () => {
    it('should calculate Merkle root', async () => {
      const dto: ClosePeriodDto = {
        orgId: 'org-123',
        period: '2025-01',
      };
      const userId = 'user-123';

      const mockEntries = [
        {
          id: 'entry-1',
          orgId: dto.orgId,
          period: dto.period,
          status: JournalEntryStatus.POSTED,
          occurredAt: new Date(),
          eventType: 'payment',
          eventId: 'event-123',
          lines: [
            {
              id: 'line-1',
              accountId: 'account-1',
              amount: '100.00',
              direction: LineDirection.DEBIT,
            },
          ],
        },
      ];

      mockClosureRepository.findOne.mockResolvedValue(null);
      mockEntryRepository.find.mockResolvedValue(mockEntries);
      mockClosureRepository.create.mockReturnValue({
        id: 'closure-123',
        period: dto.period,
        orgId: dto.orgId,
        merkleRoot: 'hash-123',
      });
      mockClosureRepository.save.mockResolvedValue({
        id: 'closure-123',
        period: dto.period,
        orgId: dto.orgId,
        merkleRoot: 'hash-123',
      });

      const result = await service.closePeriod(dto, userId);

      expect(result).toHaveProperty('merkleRoot');
      expect(mockClosureRepository.save).toHaveBeenCalled();
    });
  });

  describe('getAccount', () => {
    it('should return account by ID', async () => {
      const accountId = 'account-123';
      const orgId = 'org-123';
      const mockAccount = {
        id: accountId,
        code: '1000',
        name: 'Cash',
        orgId,
        parent: null,
        children: [],
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.getAccount(accountId, orgId);

      expect(result).toEqual(mockAccount);
      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: accountId, orgId },
        relations: ['parent', 'children'],
      });
    });

    it('should throw NotFoundException if account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getAccount('invalid-id', 'org-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getJournalEntry', () => {
    it('should return journal entry by ID', async () => {
      const entryId = 'entry-123';
      const orgId = 'org-123';
      const mockEntry = {
        id: entryId,
        orgId,
        eventType: 'payment',
        eventId: 'event-123',
        lines: [],
      };

      mockEntryRepository.findOne.mockResolvedValue(mockEntry);

      const result = await service.getJournalEntry(entryId, orgId);

      expect(result).toEqual(mockEntry);
      expect(mockEntryRepository.findOne).toHaveBeenCalledWith({
        where: { id: entryId, orgId },
        relations: ['lines', 'lines.account'],
      });
    });

    it('should throw NotFoundException if entry not found', async () => {
      mockEntryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getJournalEntry('invalid-id', 'org-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPeriodClosure', () => {
    it('should return period closure', async () => {
      const closureId = 'closure-123';
      const orgId = 'org-123';
      const mockClosure = {
        id: closureId,
        orgId,
        period: '2024-01',
        merkleRoot: '0x123',
      };

      mockClosureRepository.findOne.mockResolvedValue(mockClosure);

      const result = await service.getPeriodClosure(closureId, orgId);

      expect(result).toEqual(mockClosure);
    });

    it('should throw NotFoundException if closure not found', async () => {
      mockClosureRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getPeriodClosure('invalid-id', 'org-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listAccounts', () => {
    it('should return all accounts for org', async () => {
      const orgId = 'org-123';
      const mockAccounts = [
        {
          id: 'account-1',
          code: '1000',
          name: 'Cash',
          orgId,
        },
      ];

      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.listAccounts(orgId);

      expect(result).toEqual(mockAccounts);
      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { orgId },
        relations: ['parent', 'children'],
        order: { code: 'ASC' },
      });
    });

    it('should filter by status when provided', async () => {
      const orgId = 'org-123';
      const status = AccountStatus.ACTIVE;

      mockAccountRepository.find.mockResolvedValue([]);

      await service.listAccounts(orgId, status);

      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { orgId, status },
        relations: ['parent', 'children'],
        order: { code: 'ASC' },
      });
    });
  });

  describe('calculateVat', () => {
    it('should calculate VAT for Norwegian MVA output', async () => {
      const dto: CalculateVatDto = {
        orgId: 'org-123',
        amountExcludingVat: '1000.00',
        vatRate: VatRate.NORWAY_STANDARD,
        vatType: VatType.OUTPUT,
        countryCode: 'NO',
      };

      const result = await service.calculateVat(dto);

      expect(result.amountExcludingVat).toBe('1000.00');
      expect(result.vatAmount).toBe('250.00');
      expect(result.amountIncludingVat).toBe('1250.00');
      expect(result.vatRate).toBe(25);
      expect(result.vatType).toBe(VatType.OUTPUT);
      expect(result.vatAccountCode).toBe('2701'); // Output MVA
    });

    it('should calculate VAT for Norwegian MVA input', async () => {
      const dto: CalculateVatDto = {
        orgId: 'org-123',
        amountExcludingVat: '1000.00',
        vatRate: VatRate.NORWAY_STANDARD,
        vatType: VatType.INPUT,
        countryCode: 'NO',
      };

      const result = await service.calculateVat(dto);

      expect(result.vatAmount).toBe('250.00');
      expect(result.vatAccountCode).toBe('2700'); // Input MVA
    });

    it('should calculate VAT for EU VAT', async () => {
      const dto: CalculateVatDto = {
        orgId: 'org-123',
        amountExcludingVat: '1000.00',
        vatRate: VatRate.EU_STANDARD,
        vatType: VatType.OUTPUT,
        countryCode: 'DE',
      };

      const result = await service.calculateVat(dto);

      expect(result.vatAmount).toBe('200.00');
      expect(result.amountIncludingVat).toBe('1200.00');
      expect(result.vatAccountCode).toBe('2711'); // Output VAT
    });

    it('should use provided VAT account code', async () => {
      const dto: CalculateVatDto = {
        orgId: 'org-123',
        amountExcludingVat: '1000.00',
        vatRate: VatRate.NORWAY_STANDARD,
        vatType: VatType.OUTPUT,
        vatAccountCode: '9999',
      };

      const result = await service.calculateVat(dto);

      expect(result.vatAccountCode).toBe('9999');
    });

    it('should calculate zero VAT correctly', async () => {
      const dto: CalculateVatDto = {
        orgId: 'org-123',
        amountExcludingVat: '1000.00',
        vatRate: VatRate.NORWAY_ZERO,
        vatType: VatType.OUTPUT,
      };

      const result = await service.calculateVat(dto);

      expect(result.vatAmount).toBe('0.00');
      expect(result.amountIncludingVat).toBe('1000.00');
    });
  });

  describe('getFinancialReport', () => {
    it('should generate Profit & Loss report', async () => {
      const dto: GetFinancialReportDto = {
        orgId: 'org-123',
        reportType: ReportType.PROFIT_LOSS,
        periodIdentifier: '2025-01',
      };

      const mockIncomeAccounts = [
        { id: 'income-1', code: '4000', name: 'Sales', type: AccountType.INCOME },
      ];
      const mockExpenseAccounts = [
        { id: 'expense-1', code: '5000', name: 'Cost of Goods', type: AccountType.EXPENSE },
      ];
      const mockEntries = [
        {
          id: 'entry-1',
          orgId: 'org-123',
          occurredAt: new Date('2025-01-15'),
          status: JournalEntryStatus.POSTED,
          lines: [
            {
              id: 'line-1',
              accountId: 'income-1',
              account: mockIncomeAccounts[0],
              amount: '1000',
              amountNative: '1000',
              direction: LineDirection.CREDIT,
              currency: 'NOR',
            },
          ],
        },
      ];

      mockAccountRepository.find
        .mockResolvedValueOnce(mockIncomeAccounts)
        .mockResolvedValueOnce(mockExpenseAccounts);
      mockEntryRepository.find.mockResolvedValue(mockEntries);

      const result = await service.getFinancialReport(dto);

      expect(result.reportType).toBe('profit_loss');
      expect(result.period).toBe('2025-01');
      expect(result.income).toBeDefined();
      expect(result.expenses).toBeDefined();
      expect(result.netProfit).toBeDefined();
    });

    it('should generate Balance Sheet report', async () => {
      const dto: GetFinancialReportDto = {
        orgId: 'org-123',
        reportType: ReportType.BALANCE_SHEET,
        periodIdentifier: '2025-01',
      };

      const mockAccounts = [
        { id: 'asset-1', code: '1000', name: 'Cash', type: AccountType.ASSET },
        { id: 'liability-1', code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY },
        { id: 'equity-1', code: '3000', name: 'Equity', type: AccountType.EQUITY },
      ];

      mockAccountRepository.find.mockResolvedValue(mockAccounts);
      mockEntryRepository.find.mockResolvedValue([]);

      const result = await service.getFinancialReport(dto);

      expect(result.reportType).toBe('balance_sheet');
      expect(result.assets).toBeDefined();
      expect(result.liabilities).toBeDefined();
      expect(result.equity).toBeDefined();
      expect(result.balance).toBeDefined();
    });

    it('should generate Cashflow report', async () => {
      const dto: GetFinancialReportDto = {
        orgId: 'org-123',
        reportType: ReportType.CASHFLOW,
        periodIdentifier: '2025-01',
      };

      const mockCashAccounts = [
        { id: 'cash-1', code: '1000', name: 'Cash', type: AccountType.ASSET },
      ];
      const mockIncomeAccounts = [
        { id: 'income-1', code: '4000', name: 'Sales', type: AccountType.INCOME },
      ];
      const mockExpenseAccounts = [
        { id: 'expense-1', code: '5000', name: 'Expenses', type: AccountType.EXPENSE },
      ];
      const mockLiabilityAccounts = [
        { id: 'liability-1', code: '2000', name: 'Debt', type: AccountType.LIABILITY },
      ];
      const mockEquityAccounts = [
        { id: 'equity-1', code: '3000', name: 'Equity', type: AccountType.EQUITY },
      ];

      mockAccountRepository.find
        .mockResolvedValueOnce(mockCashAccounts)
        .mockResolvedValueOnce(mockIncomeAccounts)
        .mockResolvedValueOnce(mockExpenseAccounts)
        .mockResolvedValueOnce(mockLiabilityAccounts)
        .mockResolvedValueOnce(mockEquityAccounts);
      mockEntryRepository.find.mockResolvedValue([]);

      const result = await service.getFinancialReport(dto);

      expect(result.reportType).toBe('cashflow');
      expect(result.operatingActivities).toBeDefined();
      expect(result.investingActivities).toBeDefined();
      expect(result.financingActivities).toBeDefined();
      expect(result.netCashFlow).toBeDefined();
      expect(result.openingBalance).toBeDefined();
      expect(result.closingBalance).toBeDefined();
    });

    it('should handle custom date range', async () => {
      const dto: GetFinancialReportDto = {
        orgId: 'org-123',
        reportType: ReportType.PROFIT_LOSS,
        period: ReportPeriod.CUSTOM,
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };

      mockAccountRepository.find.mockResolvedValue([]);
      mockEntryRepository.find.mockResolvedValue([]);

      const result = await service.getFinancialReport(dto);

      expect(result.reportType).toBe('profit_loss');
      expect(result.startDate).toBe('2025-01-01T00:00:00.000Z');
      expect(result.endDate).toBe('2025-01-31T23:59:59.000Z');
    });

    it('should throw BadRequestException for invalid period identifier', async () => {
      const dto: GetFinancialReportDto = {
        orgId: 'org-123',
        reportType: ReportType.PROFIT_LOSS,
        periodIdentifier: 'invalid',
      };

      await expect(service.getFinancialReport(dto)).rejects.toThrow(BadRequestException);
    });

    it('should include comparative period when requested', async () => {
      const dto: GetFinancialReportDto = {
        orgId: 'org-123',
        reportType: ReportType.PROFIT_LOSS,
        periodIdentifier: '2025-01',
        includeComparative: true,
      };

      mockAccountRepository.find.mockResolvedValue([]);
      mockEntryRepository.find.mockResolvedValue([]);

      const result = await service.getFinancialReport(dto);

      expect(result.comparative).toBeDefined();
      expect(result.comparative.variance).toBeDefined();
    });
  });

  describe('createReconciliation', () => {
    it('should create a reconciliation', async () => {
      const dto: CreateReconciliationDto = {
        orgId: 'org-123',
        type: ReconciliationType.BANK,
        period: '2025-01',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
        accountCode: '1000',
        openingBalance: '1000.00',
        closingBalance: '1500.00',
      };

      const mockAccount = {
        id: 'acc-1',
        code: '1000',
        orgId: 'org-123',
      };

      const mockReconciliation = {
        id: 'recon-1',
        ...dto,
        status: ReconciliationStatus.PENDING,
        ledgerTotal: '0',
        externalTotal: '0',
        difference: '0',
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockReconciliationRepository.create.mockReturnValue(mockReconciliation);
      mockReconciliationRepository.save.mockResolvedValue(mockReconciliation);

      const result = await service.createReconciliation(dto, 'user-123');

      expect(result).toEqual(mockReconciliation);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'reconciliation.created',
        expect.objectContaining({
          reconciliationId: 'recon-1',
        }),
      );
    });

    it('should throw NotFoundException if account not found', async () => {
      const dto: CreateReconciliationDto = {
        orgId: 'org-123',
        type: ReconciliationType.BANK,
        period: '2025-01',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
        accountCode: '9999',
      };

      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createReconciliation(dto, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create reconciliation without account code', async () => {
      const dto: CreateReconciliationDto = {
        orgId: 'org-123',
        type: ReconciliationType.WALLET,
        period: '2025-01',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };

      const mockReconciliation = {
        id: 'recon-2',
        ...dto,
        status: ReconciliationStatus.PENDING,
      };

      mockReconciliationRepository.create.mockReturnValue(mockReconciliation);
      mockReconciliationRepository.save.mockResolvedValue(mockReconciliation);

      const result = await service.createReconciliation(dto, 'user-123');

      expect(result).toEqual(mockReconciliation);
      expect(mockAccountRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getReconciliation', () => {
    it('should return reconciliation by ID', async () => {
      const reconciliationId = 'recon-1';
      const orgId = 'org-123';
      const mockReconciliation = {
        id: reconciliationId,
        orgId,
        type: ReconciliationType.BANK,
        matches: [],
      };

      mockReconciliationRepository.findOne.mockResolvedValue(mockReconciliation);

      const result = await service.getReconciliation(reconciliationId, orgId);

      expect(result).toEqual(mockReconciliation);
    });

    it('should throw NotFoundException if reconciliation not found', async () => {
      mockReconciliationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getReconciliation('non-existent', 'org-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listReconciliations', () => {
    it('should list all reconciliations', async () => {
      const orgId = 'org-123';
      const mockReconciliations = [
        {
          id: 'recon-1',
          orgId,
          type: ReconciliationType.BANK,
        },
        {
          id: 'recon-2',
          orgId,
          type: ReconciliationType.WALLET,
        },
      ];

      mockReconciliationRepository.findAndCount.mockResolvedValue([
        mockReconciliations,
        2,
      ]);

      const result = await service.listReconciliations(orgId);

      expect(result.reconciliations).toEqual(mockReconciliations);
      expect(result.total).toBe(2);
    });

    it('should filter by type', async () => {
      const orgId = 'org-123';
      const type = ReconciliationType.BANK;

      mockReconciliationRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listReconciliations(orgId, type);

      expect(mockReconciliationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orgId, type },
        }),
      );
    });

    it('should filter by status', async () => {
      const orgId = 'org-123';
      const status = ReconciliationStatus.COMPLETED;

      mockReconciliationRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listReconciliations(orgId, undefined, status);

      expect(mockReconciliationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orgId, status },
        }),
      );
    });

    it('should support pagination', async () => {
      const orgId = 'org-123';
      mockReconciliationRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listReconciliations(orgId, undefined, undefined, 10, 20);

      expect(mockReconciliationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        }),
      );
    });
  });

  describe('matchTransaction', () => {
    it('should match a transaction', async () => {
      const dto: MatchTransactionDto = {
        reconciliationId: 'recon-1',
        ledgerEntryId: 'entry-1',
        amount: '100.00',
        transactionDate: '2025-01-15T00:00:00Z',
        matchType: MatchType.EXACT,
      };

      const mockReconciliation = {
        id: 'recon-1',
        orgId: 'org-123',
      };

      const mockEntry = {
        id: 'entry-1',
        orgId: 'org-123',
      };

      const mockMatch = {
        id: 'match-1',
        ...dto,
        transactionDate: new Date(dto.transactionDate),
      };

      mockReconciliationRepository.findOne
        .mockResolvedValueOnce(mockReconciliation)
        .mockResolvedValueOnce(mockReconciliation);
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockReconciliationMatchRepository.create.mockReturnValue(mockMatch);
      mockReconciliationMatchRepository.save.mockResolvedValue(mockMatch);
      mockReconciliationMatchRepository.find.mockResolvedValue([mockMatch]);
      mockReconciliationRepository.save.mockResolvedValue(mockReconciliation);

      const result = await service.matchTransaction(dto, 'user-123');

      expect(result).toEqual(mockMatch);
      expect(mockReconciliationMatchRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if reconciliation not found', async () => {
      const dto: MatchTransactionDto = {
        reconciliationId: 'non-existent',
        amount: '100.00',
        transactionDate: '2025-01-15T00:00:00Z',
      };

      mockReconciliationRepository.findOne.mockResolvedValue(null);

      await expect(service.matchTransaction(dto, 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if ledger entry not found', async () => {
      const dto: MatchTransactionDto = {
        reconciliationId: 'recon-1',
        ledgerEntryId: 'non-existent',
        amount: '100.00',
        transactionDate: '2025-01-15T00:00:00Z',
      };

      const mockReconciliation = {
        id: 'recon-1',
        orgId: 'org-123',
      };

      mockReconciliationRepository.findOne.mockResolvedValue(mockReconciliation);
      mockEntryRepository.findOne.mockResolvedValue(null);

      await expect(service.matchTransaction(dto, 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('autoMatchTransactions', () => {
    it('should auto-match transactions', async () => {
      const reconciliationId = 'recon-1';
      const orgId = 'org-123';

      const mockReconciliation = {
        id: reconciliationId,
        orgId,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      };

      const mockEntries = [
        {
          id: 'entry-1',
          orgId,
          occurredAt: new Date('2025-01-15'),
          status: JournalEntryStatus.POSTED,
          lines: [
            {
              amountNative: '100.00',
              direction: LineDirection.DEBIT,
            },
          ],
        },
        {
          id: 'entry-2',
          orgId,
          occurredAt: new Date('2025-01-20'),
          status: JournalEntryStatus.POSTED,
          lines: [
            {
              amountNative: '50.00',
              direction: LineDirection.CREDIT,
            },
          ],
        },
      ];

      mockReconciliationRepository.findOne.mockResolvedValue(mockReconciliation);
      mockEntryRepository.find.mockResolvedValue(mockEntries);
      mockReconciliationMatchRepository.find.mockResolvedValue([]);
      mockReconciliationMatchRepository.create.mockReturnValue({});
      mockReconciliationMatchRepository.save.mockResolvedValue({});
      mockReconciliationRepository.save.mockResolvedValue(mockReconciliation);

      const result = await service.autoMatchTransactions(reconciliationId, orgId);

      expect(result.matched).toBeGreaterThan(0);
      expect(result.unmatched).toBeDefined();
    });

    it('should throw NotFoundException if reconciliation not found', async () => {
      mockReconciliationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.autoMatchTransactions('non-existent', 'org-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReconciliationDetails', () => {
    it('should return reconciliation details with matches', async () => {
      const reconciliationId = 'recon-1';
      const orgId = 'org-123';

      const mockReconciliation = {
        id: reconciliationId,
        orgId,
        type: ReconciliationType.BANK,
      };

      const mockMatches = [
        {
          id: 'match-1',
          reconciliationId,
          ledgerEntryId: 'entry-1',
          amount: '100.00',
        },
      ];

      const mockEntries = [
        {
          id: 'entry-1',
          orgId,
          occurredAt: new Date('2025-01-15'),
        },
        {
          id: 'entry-2',
          orgId,
          occurredAt: new Date('2025-01-20'),
        },
      ];

      mockReconciliationRepository.findOne
        .mockResolvedValueOnce(mockReconciliation)
        .mockResolvedValueOnce(mockReconciliation);
      mockReconciliationMatchRepository.find.mockResolvedValue(mockMatches);
      mockEntryRepository.find.mockResolvedValue(mockEntries);

      const result = await service.getReconciliationDetails(
        reconciliationId,
        orgId,
      );

      expect(result.reconciliation).toEqual(mockReconciliation);
      expect(result.matches).toEqual(mockMatches);
      expect(result.unmatchedLedger).toBeDefined();
    });
  });
});
