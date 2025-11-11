import { Test, TestingModule } from '@nestjs/testing';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

describe('LedgerController', () => {
  let controller: LedgerController;
  let service: LedgerService;

  const mockLedgerService = {
    createAccount: jest.fn(),
    listAccounts: jest.fn(),
    getAccount: jest.fn(),
    createJournalEntry: jest.fn(),
    getJournalEntry: jest.fn(),
    getAccountStatement: jest.fn(),
    closePeriod: jest.fn(),
    getPeriodClosure: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LedgerController],
      providers: [
        {
          provide: LedgerService,
          useValue: mockLedgerService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LedgerController>(LedgerController);
    service = module.get<LedgerService>(LedgerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create an account', async () => {
      const dto = {
        code: '1100',
        name: 'User NOR Cash',
        type: 'asset' as any,
        currency: 'NOR',
        orgId: 'org_123',
      };

      const mockAccount = { id: 'acc_123', ...dto };
      mockLedgerService.createAccount.mockResolvedValue(mockAccount);

      const req = { user: { id: 'user_123' } };
      const result = await controller.createAccount(req as any, dto);

      expect(result).toEqual(mockAccount);
      expect(mockLedgerService.createAccount).toHaveBeenCalledWith(dto, 'user_123');
    });
  });

  describe('createJournalEntry', () => {
    it('should create a journal entry', async () => {
      const dto = {
        orgId: 'org_123',
        eventType: 'payment.succeeded',
        eventId: 'pay_123',
        occurredAt: new Date().toISOString(),
        period: '2025-01',
        lines: [
          {
            account: '1100',
            currency: 'NOR',
            amount: '100.00',
            direction: 'debit' as any,
          },
          {
            account: '4000',
            currency: 'NOR',
            amount: '100.00',
            direction: 'credit' as any,
          },
        ],
      };

      const mockEntry = { id: 'entry_123', ...dto };
      mockLedgerService.createJournalEntry.mockResolvedValue(mockEntry);

      const req = { user: { id: 'user_123' } };
      const result = await controller.createJournalEntry(req as any, dto);

      expect(result).toEqual(mockEntry);
      expect(mockLedgerService.createJournalEntry).toHaveBeenCalledWith(dto, 'user_123');
    });
  });
});

