import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { PaymentInvoice, InvoiceStatus, PaymentMethod } from './entities/payment-invoice.entity';
import { POSSession, POSSessionStatus } from './entities/pos-session.entity';
import { MerchantSettlement, SettlementStatus, SettlementType } from './entities/merchant-settlement.entity';
import { Merchant, KYCTier, SettlementPreference } from './entities/merchant.entity';
import { Product } from './entities/product.entity';
import { Price, BillingCycle } from './entities/price.entity';
import { Customer } from './entities/customer.entity';
import { PaymentMethod as PaymentMethodEntity } from './entities/payment-method.entity';
import { CheckoutSession, CheckoutSessionStatus } from './entities/checkout-session.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Refund, RefundStatus } from './entities/refund.entity';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { RpcService } from '@/common/services/rpc.service';
import { PolicyService } from '../policy/policy.service';
import { LedgerService } from '../ledger/ledger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePOSSessionDto } from './dto/create-pos-session.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreateCheckoutSessionWithLineItemsDto } from './dto/create-checkout-session-with-line-items.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { OnboardMerchantDto } from './dto/onboard-merchant.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let invoiceRepository: Repository<PaymentInvoice>;
  let posSessionRepository: Repository<POSSession>;
  let settlementRepository: Repository<MerchantSettlement>;
  let merchantRepository: Repository<Merchant>;
  let checkoutSessionRepository: Repository<CheckoutSession>;
  let paymentRepository: Repository<Payment>;
  let refundRepository: Repository<Refund>;
  let productRepository: Repository<Product>;
  let priceRepository: Repository<Price>;
  let customerRepository: Repository<Customer>;
  let subscriptionRepository: Repository<Subscription>;
  let disputeRepository: Repository<Dispute>;
  let webhookEndpointRepository: Repository<WebhookEndpoint>;
  let rpcService: RpcService;
  let policyService: PolicyService;
  let ledgerService: LedgerService;

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

  const mockMerchantRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockPriceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCustomerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPaymentMethodRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCheckoutSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRefundRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSubscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDisputeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockWebhookEndpointRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRpcService = {
    getProvider: jest.fn(),
  };

  const mockPolicyService = {
    checkPolicy: jest.fn().mockResolvedValue({ allowed: true }),
  };

  const mockLedgerService = {
    createJournalEntry: jest.fn().mockResolvedValue({}),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
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
          provide: getRepositoryToken(Merchant),
          useValue: mockMerchantRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Price),
          useValue: mockPriceRepository,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(PaymentMethodEntity),
          useValue: mockPaymentMethodRepository,
        },
        {
          provide: getRepositoryToken(CheckoutSession),
          useValue: mockCheckoutSessionRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(Refund),
          useValue: mockRefundRepository,
        },
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: getRepositoryToken(Dispute),
          useValue: mockDisputeRepository,
        },
        {
          provide: getRepositoryToken(WebhookEndpoint),
          useValue: mockWebhookEndpointRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: PolicyService,
          useValue: mockPolicyService,
        },
        {
          provide: LedgerService,
          useValue: mockLedgerService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    invoiceRepository = module.get<Repository<PaymentInvoice>>(getRepositoryToken(PaymentInvoice));
    posSessionRepository = module.get<Repository<POSSession>>(getRepositoryToken(POSSession));
    settlementRepository = module.get<Repository<MerchantSettlement>>(getRepositoryToken(MerchantSettlement));
    merchantRepository = module.get<Repository<Merchant>>(getRepositoryToken(Merchant));
    checkoutSessionRepository = module.get<Repository<CheckoutSession>>(getRepositoryToken(CheckoutSession));
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    refundRepository = module.get<Repository<Refund>>(getRepositoryToken(Refund));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    priceRepository = module.get<Repository<Price>>(getRepositoryToken(Price));
    customerRepository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
    subscriptionRepository = module.get<Repository<Subscription>>(getRepositoryToken(Subscription));
    disputeRepository = module.get<Repository<Dispute>>(getRepositoryToken(Dispute));
    webhookEndpointRepository = module.get<Repository<WebhookEndpoint>>(getRepositoryToken(WebhookEndpoint));
    rpcService = module.get<RpcService>(RpcService);
    policyService = module.get<PolicyService>(PolicyService);
    ledgerService = module.get<LedgerService>(LedgerService);
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
        createdAt: new Date(),
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

      await expect(service.getInvoice('user-123', 'invalid-id')).rejects.toThrow(NotFoundException);
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

    it('should filter by status', async () => {
      const userId = 'user-123';
      mockInvoiceRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getInvoices(userId, 50, 0, InvoiceStatus.PAID);

      expect(mockInvoiceRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, status: InvoiceStatus.PAID },
        }),
      );
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
        metadata: {},
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

    it('should mark session as expired if past expiration', async () => {
      const merchantId = 'merchant-123';
      const sessionId = 'session-123';
      const mockSession = {
        id: sessionId,
        amount: '1000',
        currency: 'NOR',
        status: POSSessionStatus.ACTIVE,
        paymentAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      mockPOSSessionRepository.findOne.mockResolvedValue(mockSession);
      mockPOSSessionRepository.save.mockResolvedValue({ ...mockSession, status: POSSessionStatus.EXPIRED });

      const result = await service.getPOSSession(merchantId, sessionId);

      expect(mockPOSSessionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if session not found', async () => {
      mockPOSSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.getPOSSession('merchant-123', 'invalid-id')).rejects.toThrow(NotFoundException);
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

      await expect(service.getSettlement('merchant-123', 'invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('onboardMerchant', () => {
    it('should onboard a new merchant', async () => {
      const orgId = 'org-123';
      const userId = 'user-123';
      const dto: OnboardMerchantDto = {
        kycTier: KYCTier.TIER_1,
        settlementPreference: SettlementPreference.CRYPTO_ONLY,
        webhookUrl: 'https://example.com/webhook',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId,
        ...dto,
        webhookSecret: 'secret-123',
        active: true,
        createdAt: new Date(),
      };

      mockMerchantRepository.findOne.mockResolvedValue(null);
      mockMerchantRepository.create.mockReturnValue(mockMerchant);
      mockMerchantRepository.save.mockResolvedValue(mockMerchant);

      const result = await service.onboardMerchant(orgId, userId, dto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('orgId', orgId);
      expect(result).toHaveProperty('webhookSecret');
      expect(mockMerchantRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if merchant already exists', async () => {
      const orgId = 'org-123';
      const userId = 'user-123';
      const dto: OnboardMerchantDto = {
        kycTier: KYCTier.TIER_1,
      };

      mockMerchantRepository.findOne.mockResolvedValue({ id: 'existing-merchant' });

      await expect(service.onboardMerchant(orgId, userId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session', async () => {
      const userId = 'user-123';
      const dto: CreateCheckoutSessionDto = {
        merchantId: 'org-123',
        amount: '1000000000000000000',
        currency: 'NOR',
        assets: ['NOR'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
        active: true,
      };

      const mockSession = {
        id: 'session-123',
        sessionId: 'cs_123',
        merchantId: 'merchant-123',
        ...dto,
        status: CheckoutSessionStatus.PENDING,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
      };

      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      mockCheckoutSessionRepository.create.mockReturnValue(mockSession);
      mockCheckoutSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.createCheckoutSession(dto, userId);

      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('payUrl');
      expect(result.status).toBe(CheckoutSessionStatus.PENDING);
    });

    it('should throw NotFoundException if merchant not found', async () => {
      const userId = 'user-123';
      const dto: CreateCheckoutSessionDto = {
        merchantId: 'invalid-org',
        amount: '1000000000000000000',
        currency: 'NOR',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      mockMerchantRepository.findOne.mockResolvedValue(null);

      await expect(service.createCheckoutSession(dto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCheckoutSession', () => {
    it('should return checkout session', async () => {
      const sessionId = 'cs_123';
      const mockSession = {
        id: 'session-123',
        sessionId,
        status: CheckoutSessionStatus.PENDING,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };

      mockCheckoutSessionRepository.findOne.mockResolvedValue(mockSession);
      mockCheckoutSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.getCheckoutSession(sessionId);

      expect(result).toHaveProperty('sessionId', sessionId);
    });

    it('should mark session as expired if past expiration', async () => {
      const sessionId = 'cs_123';
      const mockSession = {
        id: 'session-123',
        sessionId,
        status: CheckoutSessionStatus.PENDING,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      mockCheckoutSessionRepository.findOne.mockResolvedValue(mockSession);
      mockCheckoutSessionRepository.save.mockResolvedValue({ ...mockSession, status: CheckoutSessionStatus.EXPIRED });

      const result = await service.getCheckoutSession(sessionId);

      expect(result.status).toBe(CheckoutSessionStatus.EXPIRED);
    });

    it('should throw NotFoundException if session not found', async () => {
      mockCheckoutSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.getCheckoutSession('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const sessionId = 'cs_123';
      const txHash = '0xabc123';
      const payerAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const blockNo = 12345;

      const mockSession = {
        id: 'session-123',
        sessionId,
        merchantId: 'merchant-123',
        amount: '1000000000000000000',
        currency: 'NOR',
        status: CheckoutSessionStatus.PENDING,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
        merchantId: 'merchant-123',
        checkoutSessionId: 'session-123',
        amount: '1000000000000000000',
        currency: 'NOR',
        payerAddress,
        txHash,
        blockNo,
        status: PaymentStatus.CONFIRMING,
        createdAt: new Date(),
      };

      mockCheckoutSessionRepository.findOne.mockResolvedValue(mockSession);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockCheckoutSessionRepository.save.mockResolvedValue({ ...mockSession, status: CheckoutSessionStatus.PAID });
      mockMerchantRepository.findOne.mockResolvedValue({ id: 'merchant-123', orgId: 'org-123' });

      const result = await service.processPayment(sessionId, txHash, payerAddress, blockNo);

      expect(result).toHaveProperty('paymentId');
      expect(result).toHaveProperty('txHash', txHash);
      expect(mockPaymentRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if session is not pending', async () => {
      const sessionId = 'cs_123';
      const mockSession = {
        id: 'session-123',
        sessionId,
        status: CheckoutSessionStatus.PAID,
      };

      mockCheckoutSessionRepository.findOne.mockResolvedValue(mockSession);

      await expect(
        service.processPayment(sessionId, '0xabc', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createRefund', () => {
    it('should create a refund successfully', async () => {
      const userId = 'user-123';
      const dto: CreateRefundDto = {
        paymentId: 'pay_123',
        amount: '500000000000000000',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        reason: 'Customer request',
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
        merchantId: 'merchant-123',
        amount: '1000000000000000000',
        currency: 'NOR',
        payerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
      };

      const mockRefund = {
        id: 'refund-123',
        refundId: 'ref_123',
        paymentId: 'payment-123',
        merchantId: 'merchant-123',
        amount: dto.amount,
        currency: 'NOR',
        recipientAddress: dto.recipientAddress,
        status: RefundStatus.PENDING,
        reason: dto.reason,
        createdAt: new Date(),
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      mockPolicyService.checkPolicy.mockResolvedValue({ allowed: true });
      mockRefundRepository.create.mockReturnValue(mockRefund);
      mockRefundRepository.save.mockResolvedValue(mockRefund);

      // Mock processRefund private method
      jest.spyOn(service as any, 'processRefund').mockResolvedValue(undefined);

      // Ensure userId matches merchant.orgId
      const result = await service.createRefund(dto, 'org-123');

      expect(result).toHaveProperty('refundId');
      expect(result).toHaveProperty('amount', dto.amount);
      expect(mockRefundRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if payment not found', async () => {
      const userId = 'user-123';
      const dto: CreateRefundDto = {
        paymentId: 'invalid-payment',
        amount: '1000000000000000000',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.createRefund(dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own payment', async () => {
      const userId = 'user-123';
      const dto: CreateRefundDto = {
        paymentId: 'pay_123',
        amount: '1000000000000000000',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
        merchantId: 'merchant-123',
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockMerchantRepository.findOne.mockResolvedValue({ id: 'merchant-123', orgId: 'different-org' });

      await expect(service.createRefund(dto, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if refund amount exceeds payment', async () => {
      const userId = 'org-123';
      const dto: CreateRefundDto = {
        paymentId: 'pay_123',
        amount: '2000000000000000000', // More than payment
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
        merchantId: 'merchant-123',
        amount: '1000000000000000000',
        currency: 'NOR',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);

      await expect(service.createRefund(dto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if policy blocks refund', async () => {
      const userId = 'user-123';
      const dto: CreateRefundDto = {
        paymentId: 'pay_123',
        amount: '500000000000000000',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
        merchantId: 'merchant-123',
        amount: '1000000000000000000',
        currency: 'NOR',
        payerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      mockPolicyService.checkPolicy.mockResolvedValue({ allowed: false });

      await expect(service.createRefund(dto, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const userId = 'user-123';
      const dto: CreateProductDto = {
        orgId: 'org-123',
        name: 'Test Product',
        description: 'Test description',
        active: true,
      };

      const mockProduct = {
        id: 'product-123',
        ...dto,
        createdAt: new Date(),
      };

      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(dto, userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', dto.name);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('createPrice', () => {
    it('should create a price for a product', async () => {
      const userId = 'user-123';
      const dto: CreatePriceDto = {
        productId: 'product-123',
        amount: '1000000000000000000',
        currency: 'NOR',
        billingCycle: BillingCycle.MONTHLY,
      };

      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
      };

      const mockPrice = {
        id: 'price-123',
        ...dto,
        active: true,
        createdAt: new Date(),
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockPriceRepository.create.mockReturnValue(mockPrice);
      mockPriceRepository.save.mockResolvedValue(mockPrice);

      const result = await service.createPrice(dto, userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('amount', dto.amount);
    });

    it('should throw NotFoundException if product not found', async () => {
      const userId = 'user-123';
      const dto: CreatePriceDto = {
        productId: 'invalid-product',
        amount: '1000000000000000000',
        currency: 'NOR',
      };

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.createPrice(dto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCatalog', () => {
    it('should return products with prices', async () => {
      const orgId = 'org-123';
      const mockProducts = [
        {
          id: 'product-1',
          orgId,
          name: 'Product 1',
          active: true,
          prices: [],
          createdAt: new Date(),
        },
      ];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.getCatalog(orgId);

      expect(result).toHaveLength(1);
      expect(mockProductRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orgId, active: true },
          relations: ['prices'],
        }),
      );
    });
  });

  describe('createCustomer', () => {
    it('should create a customer with address', async () => {
      const userId = 'user-123';
      const dto: CreateCustomerDto = {
        orgId: 'org-123',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        displayName: 'John Doe',
      };

      const mockCustomer = {
        id: 'customer-123',
        ...dto,
        address: dto.address.toLowerCase(),
        createdAt: new Date(),
      };

      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(dto, userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('address', dto.address.toLowerCase());
    });

    it('should create a customer with email', async () => {
      const userId = 'user-123';
      const dto: CreateCustomerDto = {
        orgId: 'org-123',
        email: 'customer@example.com',
        displayName: 'Jane Doe',
      };

      const mockCustomer = {
        id: 'customer-123',
        ...dto,
        email: dto.email.toLowerCase(),
        createdAt: new Date(),
      };

      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(dto, userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', dto.email.toLowerCase());
    });

    it('should throw BadRequestException if neither address nor email provided', async () => {
      const userId = 'user-123';
      const dto: CreateCustomerDto = {
        orgId: 'org-123',
        displayName: 'John Doe',
      };

      await expect(service.createCustomer(dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createCheckoutSessionWithLineItems', () => {
    it('should create checkout session with line items', async () => {
      const userId = 'user-123';
      const dto: CreateCheckoutSessionWithLineItemsDto = {
        orgId: 'org-123',
        lineItems: [
          { priceId: 'price-1', quantity: 2 },
          { priceId: 'price-2', quantity: 1 },
        ],
        assetSet: ['NOR'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
        active: true,
      };

      const mockPrices = [
        { id: 'price-1', amount: '1000000000000000000', active: true },
        { id: 'price-2', amount: '500000000000000000', active: true },
      ];

      const mockSession = {
        id: 'session-123',
        sessionId: 'cs_123',
        merchantId: 'merchant-123',
        amount: '2500000000000000000', // 2 * 1 + 1 * 0.5
        currency: 'NOR',
        status: CheckoutSessionStatus.PENDING,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
      };

      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      mockPriceRepository.findOne
        .mockResolvedValueOnce(mockPrices[0])
        .mockResolvedValueOnce(mockPrices[1]);
      mockCheckoutSessionRepository.create.mockReturnValue(mockSession);
      mockCheckoutSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.createCheckoutSessionWithLineItems(dto, userId);

      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('payUrl');
      expect(result.amount).toBe('2500000000000000000');
    });

    it('should throw NotFoundException if price not found', async () => {
      const userId = 'user-123';
      const dto: CreateCheckoutSessionWithLineItemsDto = {
        orgId: 'org-123',
        lineItems: [{ priceId: 'invalid-price', quantity: 1 }],
        assetSet: ['NOR'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
        active: true,
      };

      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      mockPriceRepository.findOne.mockResolvedValue(null);

      await expect(service.createCheckoutSessionWithLineItems(dto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription', async () => {
      const userId = 'user-123';
      const dto: CreateSubscriptionDto = {
        priceId: 'price-123',
        customerId: 'customer-123',
      };

      const mockPrice = {
        id: 'price-123',
        amount: '1000000000000000000',
        billingCycle: BillingCycle.MONTHLY,
        active: true,
      };

      const mockCustomer = {
        id: 'customer-123',
        orgId: 'org-123',
      };

      const mockSubscription = {
        id: 'subscription-123',
        priceId: dto.priceId,
        customerId: dto.customerId,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      mockPriceRepository.findOne.mockResolvedValue(mockPrice);
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      const result = await service.createSubscription(dto, userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('priceId', dto.priceId);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.created', expect.any(Object));
    });

    it('should throw NotFoundException if price not found', async () => {
      const userId = 'user-123';
      const dto: CreateSubscriptionDto = {
        priceId: 'invalid-price',
        customerId: 'customer-123',
      };

      mockPriceRepository.findOne.mockResolvedValue(null);

      await expect(service.createSubscription(dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if price has no billing cycle', async () => {
      const userId = 'user-123';
      const dto: CreateSubscriptionDto = {
        priceId: 'price-123',
        customerId: 'customer-123',
      };

      const mockPrice = {
        id: 'price-123',
        billingCycle: null,
        active: true,
      };

      mockPriceRepository.findOne.mockResolvedValue(mockPrice);

      await expect(service.createSubscription(dto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if customer not found', async () => {
      const userId = 'user-123';
      const dto: CreateSubscriptionDto = {
        priceId: 'price-123',
        customerId: 'invalid-customer',
      };

      const mockPrice = {
        id: 'price-123',
        billingCycle: BillingCycle.MONTHLY,
        active: true,
      };

      mockPriceRepository.findOne.mockResolvedValue(mockPrice);
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.createSubscription(dto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel a subscription', async () => {
      const userId = 'user-123';
      const subscriptionId = 'subscription-123';

      const mockSubscription = {
        id: subscriptionId,
        status: SubscriptionStatus.ACTIVE,
        canceledAt: null,
      };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      });

      const result = await service.cancelSubscription(subscriptionId, userId);

      expect(result.status).toBe(SubscriptionStatus.CANCELED);
      expect(result).toHaveProperty('canceledAt');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.canceled', expect.any(Object));
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelSubscription('invalid-id', 'user-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDispute', () => {
    it('should create a dispute', async () => {
      const userId = 'user-123';
      const dto: CreateDisputeDto = {
        paymentId: 'pay_123',
        reason: 'Item not received',
        customerEvidence: { text: 'Evidence text' },
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
        merchantId: 'merchant-123',
      };

      const mockDispute = {
        id: 'dispute-123',
        paymentId: 'payment-123',
        merchantId: 'merchant-123',
        status: DisputeStatus.OPEN,
        reason: dto.reason,
        customerEvidence: dto.customerEvidence,
        createdAt: new Date(),
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockDisputeRepository.findOne.mockResolvedValue(null);
      mockDisputeRepository.create.mockReturnValue(mockDispute);
      mockDisputeRepository.save.mockResolvedValue(mockDispute);

      // Mock sendWebhook private method
      jest.spyOn(service as any, 'sendWebhook').mockResolvedValue(undefined);

      const result = await service.createDispute(dto, userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status', DisputeStatus.OPEN);
    });

    it('should throw NotFoundException if payment not found', async () => {
      const userId = 'user-123';
      const dto: CreateDisputeDto = {
        paymentId: 'invalid-payment',
        reason: 'Test',
      };

      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.createDispute(dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if dispute already exists', async () => {
      const userId = 'user-123';
      const dto: CreateDisputeDto = {
        paymentId: 'pay_123',
        reason: 'Test',
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockDisputeRepository.findOne.mockResolvedValue({ id: 'existing-dispute' });

      await expect(service.createDispute(dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('registerWebhook', () => {
    it('should register a webhook endpoint', async () => {
      const orgId = 'org-123';
      const userId = 'user-123';
      const url = 'https://example.com/webhook';
      const events = ['payment.succeeded', 'refund.succeeded'];

      const mockWebhook = {
        id: 'webhook-123',
        orgId,
        url,
        hmacSecret: 'secret-123',
        events,
        active: true,
        createdAt: new Date(),
      };

      mockWebhookEndpointRepository.create.mockReturnValue(mockWebhook);
      mockWebhookEndpointRepository.save.mockResolvedValue(mockWebhook);

      const result = await service.registerWebhook(orgId, url, events, userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url', url);
      expect(result).toHaveProperty('hmacSecret');
      expect(result.events).toEqual(events);
    });

    it('should generate unique HMAC secret for each webhook', async () => {
      const orgId = 'org-123';
      const userId = 'user-123';
      const url = 'https://example.com/webhook';
      const events = ['payment.succeeded'];

      const mockWebhook1 = {
        id: 'webhook-1',
        orgId,
        url,
        hmacSecret: 'secret-1',
        events,
      };
      const mockWebhook2 = {
        id: 'webhook-2',
        orgId,
        url,
        hmacSecret: 'secret-2',
        events,
      };

      mockWebhookEndpointRepository.create
        .mockReturnValueOnce(mockWebhook1)
        .mockReturnValueOnce(mockWebhook2);
      mockWebhookEndpointRepository.save
        .mockResolvedValueOnce(mockWebhook1)
        .mockResolvedValueOnce(mockWebhook2);

      const result1 = await service.registerWebhook(orgId, url, events, userId);
      const result2 = await service.registerWebhook(orgId, url, events, userId);

      expect(result1.hmacSecret).not.toBe(result2.hmacSecret);
    });
  });

  describe('processPayment', () => {
    it('should handle payment with block number', async () => {
      const sessionId = 'session-123';
      const txHash = '0x123';
      const payerAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const blockNo = 12345;

      const mockSession = {
        id: 'session-123',
        status: CheckoutSessionStatus.PENDING,
        merchantId: 'merchant-123',
        amount: '100.00',
        currency: 'NOR',
        sessionId: 'session-123',
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
        merchantId: 'merchant-123',
        amount: '100.00',
        currency: 'NOR',
        txHash,
        blockNo,
        status: PaymentStatus.CONFIRMING,
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
      };

      mockCheckoutSessionRepository.findOne.mockResolvedValue(mockSession);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockCheckoutSessionRepository.save.mockResolvedValue({
        ...mockSession,
        status: CheckoutSessionStatus.PAID,
      });
      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      jest.spyOn(service as any, 'postPaymentToLedger').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'sendWebhook').mockResolvedValue(undefined);

      const result = await service.processPayment(
        sessionId,
        txHash,
        payerAddress,
        blockNo,
      );

      expect(result).toHaveProperty('blockNo', blockNo);
      expect(result.txHash).toBe(txHash);
    });
  });

  describe('createRefund', () => {
    it('should handle partial refund', async () => {
      const userId = 'org-123';
      const dto: CreateRefundDto = {
        paymentId: 'pay_123',
        amount: '50.00', // Partial refund
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'pay_123',
        merchantId: 'merchant-123',
        amount: '100.00',
        currency: 'NOR',
        payerAddress: '0x123',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
      };

      const mockRefund = {
        id: 'refund-123',
        refundId: 'refund_123',
        paymentId: 'pay_123',
        amount: dto.amount,
        status: RefundStatus.PENDING,
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      mockPolicyService.checkPolicy.mockResolvedValue({
        allowed: true,
        status: 'allowed',
        checks: [],
        riskScore: 10,
        requiresReview: false,
        auditHash: 'hash-123',
      });
      mockRefundRepository.create.mockReturnValue(mockRefund);
      mockRefundRepository.save.mockResolvedValue(mockRefund);
      jest.spyOn(service as any, 'processRefund').mockResolvedValue(undefined);

      const result = await service.createRefund(dto, userId);

      expect(result).toHaveProperty('refundId');
      expect(result.amount).toBe(dto.amount);
    });
  });

  describe('cancelSubscription', () => {
    it('should emit subscription.canceled event', async () => {
      const subscriptionId = 'subscription-123';
      const userId = 'user-123';

      const mockSubscription = {
        id: subscriptionId,
        status: SubscriptionStatus.ACTIVE,
        canceledAt: null,
      };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      });

      await service.cancelSubscription(subscriptionId, userId);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'subscription.canceled',
        expect.objectContaining({
          subscriptionId,
        }),
      );
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.cancelSubscription('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCatalog', () => {
    it('should return empty array when no products', async () => {
      const orgId = 'org-123';
      mockProductRepository.find.mockResolvedValue([]);

      const result = await service.getCatalog(orgId);

      expect(result).toEqual([]);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { orgId, active: true },
        relations: ['prices'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return products with prices', async () => {
      const orgId = 'org-123';
      const mockProducts = [
        {
          id: 'product-1',
          orgId,
          name: 'Product 1',
          prices: [{ id: 'price-1', amount: '100' }],
        },
      ];

      mockProductRepository.find.mockResolvedValue(mockProducts as any);

      const result = await service.getCatalog(orgId);

      expect(result).toEqual(mockProducts);
      expect(result[0]).toHaveProperty('prices');
    });
  });

  describe('createCheckoutSessionWithLineItems', () => {
    it('should calculate total from multiple line items', async () => {
      const userId = 'user-123';
      const dto: CreateCheckoutSessionWithLineItemsDto = {
        orgId: 'org-123',
        assetSet: ['NOR'],
        lineItems: [
          { priceId: 'price-1', quantity: 2 },
          { priceId: 'price-2', quantity: 1 },
        ],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
        active: true,
      };

      const mockPrice1 = { id: 'price-1', amount: '100.00', active: true };
      const mockPrice2 = { id: 'price-2', amount: '50.00', active: true };

      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant as any);
      mockPriceRepository.findOne
        .mockResolvedValueOnce(mockPrice1 as any)
        .mockResolvedValueOnce(mockPrice2 as any);
      mockCheckoutSessionRepository.create.mockReturnValue({
        sessionId: 'cs_123',
        amount: '250.00',
      } as any);
      mockCheckoutSessionRepository.save.mockResolvedValue({
        sessionId: 'cs_123',
        amount: '250.00',
      } as any);

      const result = await service.createCheckoutSessionWithLineItems(dto, userId);

      expect(result).toHaveProperty('payUrl');
      expect(result.amount).toBe('250.00'); // (100 * 2) + (50 * 1)
    });

    it('should throw NotFoundException if price not found in line items', async () => {
      const userId = 'user-123';
      const dto: CreateCheckoutSessionWithLineItemsDto = {
        orgId: 'org-123',
        assetSet: ['NOR'],
        lineItems: [{ priceId: 'non-existent', quantity: 1 }],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockMerchant = {
        id: 'merchant-123',
        orgId: 'org-123',
        active: true,
      };

      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant as any);
      mockPriceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createCheckoutSessionWithLineItems(dto, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Edge Cases', () => {
    it('should handle getInvoices with empty result', async () => {
      const userId = 'user-123';
      mockInvoiceRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getInvoices(userId, 50, 0);

      expect(result.invoices).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle getSettlements with empty result', async () => {
      const merchantId = 'merchant-123';
      mockSettlementRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getSettlements(merchantId, 50, 0);

      expect(result.settlements).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle createProduct with active false', async () => {
      const userId = 'user-123';
      const dto: CreateProductDto = {
        orgId: 'org-123',
        name: 'Test Product',
        active: false,
      };

      const mockProduct = {
        id: 'product-123',
        ...dto,
        active: false,
      };

      mockProductRepository.create.mockReturnValue(mockProduct as any);
      mockProductRepository.save.mockResolvedValue(mockProduct as any);

      const result = await service.createProduct(dto, userId);

      expect(result.active).toBe(false);
    });
  });

  describe('getCheckoutSession', () => {
    it('should return checkout session', async () => {
      const sessionId = 'cs_1234567890_abcdef';
      const mockSession = {
        id: 'session-123',
        sessionId,
        merchantId: 'merchant-123',
        amount: '100.00',
        currency: 'NOR',
        status: CheckoutSessionStatus.PENDING,
      };

      mockCheckoutSessionRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.getCheckoutSession(sessionId);

      expect(result).toEqual(mockSession);
      expect(mockCheckoutSessionRepository.findOne).toHaveBeenCalledWith({
        where: { sessionId },
      });
    });

    it('should throw NotFoundException if session not found', async () => {
      mockCheckoutSessionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getCheckoutSession('invalid-session'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const userId = 'user-123';
      const dto: CreateSubscriptionDto = {
        customerId: 'customer-123',
        priceId: 'price-123',
      };

      const mockPrice = {
        id: 'price-123',
        amount: '10.00',
        currency: 'NOR',
        billingCycle: BillingCycle.MONTHLY,
        active: true,
      };

      const mockCustomer = {
        id: 'customer-123',
        orgId: 'org-123',
      };

      const mockSubscription = {
        id: 'subscription-123',
        ...dto,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
      };

      mockPriceRepository.findOne.mockResolvedValue(mockPrice);
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      const result = await service.createSubscription(dto, userId);

      expect(result).toHaveProperty('id');
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if price not found', async () => {
      const userId = 'user-123';
      const dto: CreateSubscriptionDto = {
        customerId: 'customer-123',
        priceId: 'invalid-price',
      };

      mockPriceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createSubscription(dto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if price has no billing cycle', async () => {
      const userId = 'user-123';
      const dto: CreateSubscriptionDto = {
        customerId: 'customer-123',
        priceId: 'price-123',
      };

      const mockPrice = {
        id: 'price-123',
        amount: '10.00',
        billingCycle: null,
        active: true,
      };

      mockPriceRepository.findOne.mockResolvedValue(mockPrice);

      await expect(
        service.createSubscription(dto, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createDispute', () => {
    it('should create dispute successfully', async () => {
      const userId = 'user-123';
      const dto: CreateDisputeDto = {
        paymentId: 'payment-123',
        reason: 'fraud',
      };

      const mockPayment = {
        id: 'payment-123',
        paymentId: 'payment-123',
        merchantId: 'merchant-123',
        status: PaymentStatus.SUCCEEDED,
      };

      const mockDispute = {
        id: 'dispute-123',
        paymentId: mockPayment.id,
        merchantId: mockPayment.merchantId,
        reason: dto.reason,
        status: DisputeStatus.OPEN,
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockDisputeRepository.findOne.mockResolvedValue(null); // No existing dispute
      mockDisputeRepository.create.mockReturnValue(mockDispute);
      mockDisputeRepository.save.mockResolvedValue(mockDispute);

      const result = await service.createDispute(dto, userId);

      expect(result).toHaveProperty('id');
      expect(mockDisputeRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if payment not found', async () => {
      const userId = 'user-123';
      const dto: CreateDisputeDto = {
        paymentId: 'invalid-payment',
        reason: 'fraud',
      };

      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createDispute(dto, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('registerWebhook', () => {
    it('should register webhook endpoint', async () => {
      const userId = 'user-123';
      const orgId = 'org-123';
      const url = 'https://example.com/webhook';
      const events = ['payment.completed'];

      const mockWebhook = {
        id: 'webhook-123',
        orgId,
        url,
        events,
        hmacSecret: 'secret-abc',
        active: true,
      };

      mockWebhookEndpointRepository.create.mockReturnValue(mockWebhook);
      mockWebhookEndpointRepository.save.mockResolvedValue(mockWebhook);

      const result = await service.registerWebhook(orgId, url, events, userId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('hmacSecret');
      expect(mockWebhookEndpointRepository.save).toHaveBeenCalled();
    });
  });
});
