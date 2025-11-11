import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { LedgerService } from './ledger.service';
import { LedgerAccount } from './entities/ledger-account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalLine } from './entities/journal-line.entity';
import { PeriodClosure } from './entities/period-closure.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { AccountStatus } from './entities/ledger-account.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ClosePeriodDto } from './dto/close-period.dto';
import { LineDirection } from './entities/journal-line.entity';

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
  });
});
