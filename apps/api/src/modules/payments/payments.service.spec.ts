import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { PaymentInvoice, InvoiceStatus, PaymentMethod } from './entities/payment-invoice.entity';
import { POSSession, POSSessionStatus } from './entities/pos-session.entity';
import { MerchantSettlement, SettlementStatus, SettlementType } from './entities/merchant-settlement.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePOSSessionDto } from './dto/create-pos-session.dto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let invoiceRepository: Repository<PaymentInvoice>;
  let posSessionRepository: Repository<POSSession>;
  let settlementRepository: Repository<MerchantSettlement>;
  let rpcService: RpcService;

  const mockInvoiceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockPOSSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSettlementRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRpcService = {
    getProvider: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(PaymentInvoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: getRepositoryToken(POSSession),
          useValue: mockPOSSessionRepository,
        },
        {
          provide: getRepositoryToken(MerchantSettlement),
          useValue: mockSettlementRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    invoiceRepository = module.get<Repository<PaymentInvoice>>(getRepositoryToken(PaymentInvoice));
    posSessionRepository = module.get<Repository<POSSession>>(getRepositoryToken(POSSession));
    settlementRepository = module.get<Repository<MerchantSettlement>>(getRepositoryToken(MerchantSettlement));
    rpcService = module.get<RpcService>(RpcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      const userId = 'user-123';
      const dto: CreateInvoiceDto = {
        description: 'Test invoice',
        amount: '1000000000000000000',
        currency: 'NOR',
        paymentMethod: PaymentMethod.CRYPTO,
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockInvoice = {
        id: 'invoice-123',
        invoiceNumber: 'INV-1234567890-ABCD',
        ...dto,
        status: InvoiceStatus.PENDING,
        userId,
        qrCode: null,
      };

      mockInvoiceRepository.create.mockReturnValue(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValueOnce(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValueOnce({ ...mockInvoice, qrCode: 'qr-data' });

      const result = await service.createInvoice(userId, dto);

      expect(result).toHaveProperty('invoice_id');
      expect(result).toHaveProperty('invoiceNumber');
      expect(result).toHaveProperty('amount', dto.amount);
      expect(result).toHaveProperty('status', InvoiceStatus.PENDING);
      expect(mockInvoiceRepository.create).toHaveBeenCalled();
      expect(mockInvoiceRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('getInvoice', () => {
    it('should return invoice details', async () => {
      const userId = 'user-123';
      const invoiceId = 'invoice-123';
      const mockInvoice = {
        id: invoiceId,
        invoiceNumber: 'INV-123',
        description: 'Test',
        amount: '1000000000000000000',
        currency: 'NOR',
        status: InvoiceStatus.PENDING,
        paymentMethod: PaymentMethod.CRYPTO,
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        qrCode: 'qr-data',
        dueDate: null,
        paidAt: null,
        paymentTxHash: null,
        metadata: null,
        createdAt: new Date(),
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.getInvoice(userId, invoiceId);

      expect(result).toHaveProperty('invoice_id', invoiceId);
      expect(result).toHaveProperty('amount', mockInvoice.amount);
      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: invoiceId, userId },
      });
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.getInvoice('user-123', 'invalid-id')).rejects.toThrow('Invoice not found');
    });
  });

  describe('getInvoices', () => {
    it('should return paginated invoices', async () => {
      const userId = 'user-123';
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-1',
          amount: '1000',
          currency: 'NOR',
          status: InvoiceStatus.PENDING,
          createdAt: new Date(),
          dueDate: null,
        },
      ];

      mockInvoiceRepository.findAndCount.mockResolvedValue([mockInvoices, 1]);

      const result = await service.getInvoices(userId, 50, 0);

      expect(result).toHaveProperty('invoices');
      expect(result).toHaveProperty('total', 1);
      expect(result.invoices).toHaveLength(1);
    });
  });

  describe('createPOSSession', () => {
    it('should create a POS session', async () => {
      const userId = 'merchant-123';
      const dto: CreatePOSSessionDto = {
        amount: '1000000000000000000',
        currency: 'NOR',
        description: 'Coffee',
      };

      const mockSession = {
        id: 'session-123',
        sessionToken: 'token-abc',
        merchantId: userId,
        ...dto,
        status: POSSessionStatus.ACTIVE,
        paymentAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        expiresAt: new Date(Date.now() + 300000),
        qrCode: null,
      };

      mockPOSSessionRepository.create.mockReturnValue(mockSession);
      mockPOSSessionRepository.save.mockResolvedValueOnce(mockSession);
      mockPOSSessionRepository.save.mockResolvedValueOnce({ ...mockSession, qrCode: 'qr-data' });

      const result = await service.createPOSSession(userId, dto);

      expect(result).toHaveProperty('session_id');
      expect(result).toHaveProperty('sessionToken');
      expect(result).toHaveProperty('amount', dto.amount);
      expect(mockPOSSessionRepository.create).toHaveBeenCalled();
    });
  });

  describe('getPOSSession', () => {
    it('should return POS session status', async () => {
      const merchantId = 'merchant-123';
      const sessionId = 'session-123';
      const mockSession = {
        id: sessionId,
        amount: '1000',
        currency: 'NOR',
        status: POSSessionStatus.ACTIVE,
        paymentAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        paymentTxHash: null,
        expiresAt: new Date(Date.now() + 300000),
        completedAt: null,
      };

      mockPOSSessionRepository.findOne.mockResolvedValue(mockSession);
      mockPOSSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.getPOSSession(merchantId, sessionId);

      expect(result).toHaveProperty('session_id', sessionId);
      expect(result).toHaveProperty('status', POSSessionStatus.ACTIVE);
    });

    it('should throw NotFoundException if session not found', async () => {
      mockPOSSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.getPOSSession('merchant-123', 'invalid-id')).rejects.toThrow('POS session not found');
    });
  });

  describe('getSettlements', () => {
    it('should return merchant settlements', async () => {
      const merchantId = 'merchant-123';
      const mockSettlements = [
        {
          id: 'settlement-1',
          type: SettlementType.DAILY,
          status: SettlementStatus.COMPLETED,
          totalAmount: '10000',
          netAmount: '9500',
          fees: '500',
          currency: 'NOR',
          periodStart: new Date(),
          periodEnd: new Date(),
          processedAt: new Date(),
          settlementTxHash: '0x123',
        },
      ];

      mockSettlementRepository.findAndCount.mockResolvedValue([mockSettlements, 1]);

      const result = await service.getSettlements(merchantId, 50, 0);

      expect(result).toHaveProperty('settlements');
      expect(result.settlements).toHaveLength(1);
    });
  });

  describe('getSettlement', () => {
    it('should return settlement details', async () => {
      const merchantId = 'merchant-123';
      const settlementId = 'settlement-123';
      const mockSettlement = {
        id: settlementId,
        type: SettlementType.DAILY,
        status: SettlementStatus.COMPLETED,
        totalAmount: '10000',
        netAmount: '9500',
        fees: '500',
        currency: 'NOR',
        transactions: ['invoice-1', 'invoice-2'],
        settlementAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        settlementTxHash: '0x123',
        periodStart: new Date(),
        periodEnd: new Date(),
        processedAt: new Date(),
        createdAt: new Date(),
      };

      mockSettlementRepository.findOne.mockResolvedValue(mockSettlement);

      const result = await service.getSettlement(merchantId, settlementId);

      expect(result).toHaveProperty('settlement_id', settlementId);
      expect(result).toHaveProperty('totalAmount', mockSettlement.totalAmount);
    });

    it('should throw NotFoundException if settlement not found', async () => {
      mockSettlementRepository.findOne.mockResolvedValue(null);

      await expect(service.getSettlement('merchant-123', 'invalid-id')).rejects.toThrow('Settlement not found');
    });
  });
});

