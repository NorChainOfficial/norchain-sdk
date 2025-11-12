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
    calculateVat: jest.fn(),
    getFinancialReport: jest.fn(),
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

  describe('calculateVat', () => {
    it('should calculate VAT', async () => {
      const dto = {
        orgId: 'org-123',
        amountExcludingVat: '1000.00',
        vatRate: 25,
        vatType: 'output' as any,
        countryCode: 'NO',
      };

      const mockResult = {
        amountExcludingVat: '1000.00',
        vatAmount: '250.00',
        amountIncludingVat: '1250.00',
        vatRate: 25,
        vatType: 'output',
        vatAccountCode: '2701',
      };

      mockLedgerService.calculateVat.mockResolvedValue(mockResult);

      const result = await controller.calculateVat(dto);

      expect(result).toEqual(mockResult);
      expect(mockLedgerService.calculateVat).toHaveBeenCalledWith(dto);
    });
  });

  describe('getFinancialReport', () => {
    it('should generate Profit & Loss report', async () => {
      const dto = {
        orgId: 'org-123',
        reportType: 'profit_loss' as any,
        periodIdentifier: '2025-01',
      };

      const mockReport = {
        reportType: 'profit_loss',
        period: '2025-01',
        income: { items: [], total: '1000.00' },
        expenses: { items: [], total: '500.00' },
        netProfit: '500.00',
      };

      mockLedgerService.getFinancialReport.mockResolvedValue(mockReport);

      const result = await controller.getFinancialReport(dto);

      expect(result).toEqual(mockReport);
      expect(mockLedgerService.getFinancialReport).toHaveBeenCalledWith(dto);
    });

    it('should generate Balance Sheet report', async () => {
      const dto = {
        orgId: 'org-123',
        reportType: 'balance_sheet' as any,
        periodIdentifier: '2025-01',
      };

      const mockReport = {
        reportType: 'balance_sheet',
        assets: { items: [], total: '5000.00' },
        liabilities: { items: [], total: '2000.00' },
        equity: { items: [], total: '3000.00' },
      };

      mockLedgerService.getFinancialReport.mockResolvedValue(mockReport);

      const result = await controller.getFinancialReport(dto);

      expect(result).toEqual(mockReport);
    });

    it('should generate Cashflow report', async () => {
      const dto = {
        orgId: 'org-123',
        reportType: 'cashflow' as any,
        periodIdentifier: '2025-01',
      };

      const mockReport = {
        reportType: 'cashflow',
        operatingActivities: { cashFlow: '1000.00' },
        investingActivities: { cashFlow: '-500.00' },
        financingActivities: { cashFlow: '200.00' },
        netCashFlow: '700.00',
      };

      mockLedgerService.getFinancialReport.mockResolvedValue(mockReport);

      const result = await controller.getFinancialReport(dto);

      expect(result).toEqual(mockReport);
    });
  });
});

