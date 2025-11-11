import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePOSSessionDto } from './dto/create-pos-session.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateCheckoutSessionWithLineItemsDto } from './dto/create-checkout-session-with-line-items.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { OnboardMerchantDto } from './dto/onboard-merchant.dto';
import { InvoiceStatus } from './entities/payment-invoice.entity';
import { KYCTier } from './entities/merchant.entity';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: jest.Mocked<PaymentsService>;

  const mockPaymentsService = {
    createInvoice: jest.fn(),
    getInvoice: jest.fn(),
    getInvoices: jest.fn(),
    createPOSSession: jest.fn(),
    getPOSSession: jest.fn(),
    getSettlements: jest.fn(),
    getSettlement: jest.fn(),
    onboardMerchant: jest.fn(),
    createCheckoutSession: jest.fn(),
    createCheckoutSessionWithLineItems: jest.fn(),
    getCheckoutSession: jest.fn(),
    createRefund: jest.fn(),
    createProduct: jest.fn(),
    createPrice: jest.fn(),
    getCatalog: jest.fn(),
    createCustomer: jest.fn(),
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    createDispute: jest.fn(),
    registerWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice', async () => {
      const userId = 'user-123';
      const dto: CreateInvoiceDto = {
        description: 'Payment for services rendered',
        amount: '1000000000000000000',
        currency: 'NOR',
        dueDate: new Date().toISOString(),
      };

      const mockResult = {
        invoice_id: 'invoice-123',
        invoiceNumber: 'INV-001',
        status: InvoiceStatus.DRAFT,
      };

      mockPaymentsService.createInvoice.mockResolvedValue(mockResult);

      const result = await controller.createInvoice({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createInvoice).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getInvoices', () => {
    it('should return paginated invoices', async () => {
      const userId = 'user-123';
      const limit = 50;
      const offset = 0;

      const mockResult = {
        invoices: [
          {
            invoice_id: 'invoice-1',
            invoiceNumber: 'INV-001',
            status: InvoiceStatus.PAID,
          },
        ],
        total: 1,
        limit,
        offset,
      };

      mockPaymentsService.getInvoices.mockResolvedValue(mockResult);

      const result = await controller.getInvoices({ user: { id: userId } }, limit, offset);

      expect(result).toEqual(mockResult);
      expect(paymentsService.getInvoices).toHaveBeenCalledWith(userId, limit, offset, undefined);
    });

    it('should filter by status', async () => {
      const userId = 'user-123';
      const limit = 50;
      const offset = 0;
      const status = InvoiceStatus.PAID;

      const mockResult = {
        invoices: [],
        total: 0,
        limit,
        offset,
      };

      mockPaymentsService.getInvoices.mockResolvedValue(mockResult);

      await controller.getInvoices({ user: { id: userId } }, limit, offset, status);

      expect(paymentsService.getInvoices).toHaveBeenCalledWith(userId, limit, offset, status);
    });
  });

  describe('getInvoice', () => {
    it('should return invoice details', async () => {
      const userId = 'user-123';
      const invoiceId = 'invoice-123';

      const mockResult = {
        invoice_id: invoiceId,
        invoiceNumber: 'INV-001',
        status: InvoiceStatus.PAID,
      };

      mockPaymentsService.getInvoice.mockResolvedValue(mockResult);

      const result = await controller.getInvoice({ user: { id: userId } }, invoiceId);

      expect(result).toEqual(mockResult);
      expect(paymentsService.getInvoice).toHaveBeenCalledWith(userId, invoiceId);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      const userId = 'user-123';
      const invoiceId = 'invalid-id';

      mockPaymentsService.getInvoice.mockRejectedValue(
        new NotFoundException('Invoice not found'),
      );

      await expect(
        controller.getInvoice({ user: { id: userId } }, invoiceId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPOSSession', () => {
    it('should create a POS session', async () => {
      const userId = 'user-123';
      const dto: CreatePOSSessionDto = {
        amount: '1000000000000000000',
        currency: 'NOR',
      };

      const mockResult = {
        session_id: 'pos-session-123',
        token: 'token-abc',
        status: 'pending',
      };

      mockPaymentsService.createPOSSession.mockResolvedValue(mockResult);

      const result = await controller.createPOSSession({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createPOSSession).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getPOSSession', () => {
    it('should return POS session status', async () => {
      const userId = 'user-123';
      const sessionId = 'pos-session-123';

      const mockResult = {
        session_id: sessionId,
        status: 'completed',
      };

      mockPaymentsService.getPOSSession.mockResolvedValue(mockResult);

      const result = await controller.getPOSSession({ user: { id: userId } }, sessionId);

      expect(result).toEqual(mockResult);
      expect(paymentsService.getPOSSession).toHaveBeenCalledWith(userId, sessionId);
    });
  });

  describe('getSettlements', () => {
    it('should return merchant settlements', async () => {
      const userId = 'merchant-123';
      const merchantId = 'merchant-123';
      const limit = 50;
      const offset = 0;

      const mockResult = {
        settlements: [
          {
            settlement_id: 'settlement-1',
            amount: '1000000000000000000',
            status: 'completed',
          },
        ],
        total: 1,
        limit,
        offset,
      };

      mockPaymentsService.getSettlements.mockResolvedValue(mockResult);

      const result = await controller.getSettlements(
        { user: { id: userId } },
        merchantId,
        limit,
        offset,
      );

      expect(result).toEqual(mockResult);
      expect(paymentsService.getSettlements).toHaveBeenCalledWith(merchantId, limit, offset);
    });

    it('should throw error when accessing other merchant settlements', async () => {
      const userId = 'user-123';
      const merchantId = 'merchant-456';

      await expect(
        controller.getSettlements({ user: { id: userId } }, merchantId, 50, 0),
      ).rejects.toThrow('Access denied');
    });
  });

  describe('getSettlement', () => {
    it('should return settlement details', async () => {
      const userId = 'merchant-123';
      const merchantId = 'merchant-123';
      const settlementId = 'settlement-123';

      const mockResult = {
        settlement_id: settlementId,
        amount: '1000000000000000000',
        status: 'completed',
      };

      mockPaymentsService.getSettlement.mockResolvedValue(mockResult);

      const result = await controller.getSettlement(
        { user: { id: userId } },
        merchantId,
        settlementId,
      );

      expect(result).toEqual(mockResult);
      expect(paymentsService.getSettlement).toHaveBeenCalledWith(merchantId, settlementId);
    });
  });

  describe('onboardMerchant', () => {
    it('should onboard a merchant', async () => {
      const userId = 'user-123';
      const orgId = 'org-123';
      const dto: OnboardMerchantDto = {
        kycTier: KYCTier.TIER_1,
      };

      const mockResult = {
        merchant_id: 'merchant-123',
        status: 'active',
      };

      mockPaymentsService.onboardMerchant.mockResolvedValue(mockResult);

      const result = await controller.onboardMerchant(
        { user: { id: userId, orgId } },
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(paymentsService.onboardMerchant).toHaveBeenCalledWith(orgId, userId, dto);
    });

    it('should use userId when orgId not available', async () => {
      const userId = 'user-123';
      const dto: OnboardMerchantDto = {
        kycTier: KYCTier.TIER_1,
      };

      const mockResult = {
        merchant_id: 'merchant-123',
      };

      mockPaymentsService.onboardMerchant.mockResolvedValue(mockResult);

      await controller.onboardMerchant({ user: { id: userId } }, dto);

      expect(paymentsService.onboardMerchant).toHaveBeenCalledWith(userId, userId, dto);
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session', async () => {
      const userId = 'user-123';
      const dto: CreateCheckoutSessionDto = {
        merchantId: 'org-123',
        amount: '100.00',
        currency: 'NOR',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockResult = {
        session_id: 'checkout-session-123',
        payUrl: 'https://pay.nor/session/checkout-session-123',
      };

      mockPaymentsService.createCheckoutSession.mockResolvedValue(mockResult);

      const result = await controller.createCheckoutSession({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createCheckoutSession).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('createCheckoutSessionWithLineItems', () => {
    it('should create checkout session with line items', async () => {
      const userId = 'user-123';
      const dto: CreateCheckoutSessionWithLineItemsDto = {
        orgId: 'org-123',
        lineItems: [
          { priceId: 'price-1', quantity: 1 },
        ],
        assetSet: ['NOR', 'USDT'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockResult = {
        session_id: 'checkout-session-123',
        payUrl: 'https://pay.nor/session/checkout-session-123',
      };

      mockPaymentsService.createCheckoutSessionWithLineItems.mockResolvedValue(mockResult);

      const result = await controller.createCheckoutSessionWithLineItems(
        { user: { id: userId } },
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(paymentsService.createCheckoutSessionWithLineItems).toHaveBeenCalledWith(
        dto,
        userId,
      );
    });
  });

  describe('getCheckoutSession', () => {
    it('should return checkout session status', async () => {
      const sessionId = 'checkout-session-123';

      const mockResult = {
        session_id: sessionId,
        status: 'completed',
      };

      mockPaymentsService.getCheckoutSession.mockResolvedValue(mockResult);

      const result = await controller.getCheckoutSession(sessionId);

      expect(result).toEqual(mockResult);
      expect(paymentsService.getCheckoutSession).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('createRefund', () => {
    it('should create a refund', async () => {
      const userId = 'user-123';
      const dto: CreateRefundDto = {
        paymentId: 'payment-123',
        amount: '50.00',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockResult = {
        refund_id: 'refund-123',
        status: 'pending',
      };

      mockPaymentsService.createRefund.mockResolvedValue(mockResult);

      const result = await controller.createRefund({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createRefund).toHaveBeenCalledWith(dto, userId);
    });

    it('should throw BadRequestException for invalid refund amount', async () => {
      const userId = 'user-123';
      const dto: CreateRefundDto = {
        paymentId: 'payment-123',
        amount: '200.00', // More than payment
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      mockPaymentsService.createRefund.mockRejectedValue(
        new BadRequestException('Refund amount exceeds payment'),
      );

      await expect(
        controller.createRefund({ user: { id: userId } }, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const userId = 'user-123';
      const dto: CreateProductDto = {
        orgId: 'org-123',
        name: 'Test Product',
        description: 'Test description',
      };

      const mockResult = {
        product_id: 'product-123',
        name: dto.name,
      };

      mockPaymentsService.createProduct.mockResolvedValue(mockResult);

      const result = await controller.createProduct({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createProduct).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('createPrice', () => {
    it('should create a price', async () => {
      const userId = 'user-123';
      const dto: CreatePriceDto = {
        productId: 'product-123',
        amount: '100.00',
        currency: 'NOR',
      };

      const mockResult = {
        price_id: 'price-123',
        amount: dto.amount,
      };

      mockPaymentsService.createPrice.mockResolvedValue(mockResult);

      const result = await controller.createPrice({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createPrice).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('getCatalog', () => {
    it('should return product catalog', async () => {
      const userId = 'user-123';
      const orgId = 'org-123';

      const mockResult = [
        {
          product_id: 'product-1',
          name: 'Product 1',
          prices: [],
        },
      ];

      mockPaymentsService.getCatalog.mockResolvedValue(mockResult);

      const result = await controller.getCatalog({ user: { id: userId, orgId } }, orgId);

      expect(result).toEqual(mockResult);
      expect(paymentsService.getCatalog).toHaveBeenCalledWith(orgId);
    });

    it('should use user orgId when orgId not provided', async () => {
      const userId = 'user-123';
      const orgId = 'org-123';

      const mockResult = [];

      mockPaymentsService.getCatalog.mockResolvedValue(mockResult);

      await controller.getCatalog({ user: { id: userId, orgId } });

      expect(paymentsService.getCatalog).toHaveBeenCalledWith(orgId);
    });

    it('should use userId when orgId not available', async () => {
      const userId = 'user-123';

      const mockResult = [];

      mockPaymentsService.getCatalog.mockResolvedValue(mockResult);

      await controller.getCatalog({ user: { id: userId } });

      expect(paymentsService.getCatalog).toHaveBeenCalledWith(userId);
    });
  });

  describe('createCustomer', () => {
    it('should create a customer', async () => {
      const userId = 'user-123';
      const dto: CreateCustomerDto = {
        orgId: 'org-123',
        email: 'customer@example.com',
        displayName: 'Test Customer',
      };

      const mockResult = {
        customer_id: 'customer-123',
        email: dto.email,
      };

      mockPaymentsService.createCustomer.mockResolvedValue(mockResult);

      const result = await controller.createCustomer({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createCustomer).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription', async () => {
      const userId = 'user-123';
      const dto: CreateSubscriptionDto = {
        customerId: 'customer-123',
        priceId: 'price-123',
      };

      const mockResult = {
        subscription_id: 'subscription-123',
        status: 'active',
      };

      mockPaymentsService.createSubscription.mockResolvedValue(mockResult);

      const result = await controller.createSubscription({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createSubscription).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel a subscription', async () => {
      const userId = 'user-123';
      const subscriptionId = 'subscription-123';

      const mockResult = {
        subscription_id: subscriptionId,
        status: 'canceled',
      };

      mockPaymentsService.cancelSubscription.mockResolvedValue(mockResult);

      const result = await controller.cancelSubscription({ user: { id: userId } }, subscriptionId);

      expect(result).toEqual(mockResult);
      expect(paymentsService.cancelSubscription).toHaveBeenCalledWith(subscriptionId, userId);
    });
  });

  describe('createDispute', () => {
    it('should create a dispute', async () => {
      const userId = 'user-123';
      const dto: CreateDisputeDto = {
        paymentId: 'payment-123',
        reason: 'Product not received',
      };

      const mockResult = {
        dispute_id: 'dispute-123',
        status: 'open',
      };

      mockPaymentsService.createDispute.mockResolvedValue(mockResult);

      const result = await controller.createDispute({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.createDispute).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('registerWebhook', () => {
    it('should register a webhook endpoint', async () => {
      const userId = 'user-123';
      const dto = {
        orgId: 'org-123',
        url: 'https://example.com/webhook',
        events: ['payment.succeeded', 'payment.failed'],
      };

      const mockResult = {
        webhook_id: 'webhook-123',
        url: dto.url,
      };

      mockPaymentsService.registerWebhook.mockResolvedValue(mockResult);

      const result = await controller.registerWebhook({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(paymentsService.registerWebhook).toHaveBeenCalledWith(
        dto.orgId,
        dto.url,
        dto.events,
        userId,
      );
    });
  });
});

