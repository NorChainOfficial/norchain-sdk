import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsV2EnhancedService } from './payments-v2-enhanced.service';
import { Merchant } from './entities/merchant.entity';
import { Product } from './entities/product.entity';
import { Price } from './entities/price.entity';
import { Customer } from './entities/customer.entity';
import { Subscription } from './entities/subscription.entity';
import { Dispute } from './entities/dispute.entity';
import { Payment } from './entities/payment.entity';
import { CheckoutSession } from './entities/checkout-session.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { Refund } from './entities/refund.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PolicyService } from '../policy/policy.service';
import { LedgerService } from '../ledger/ledger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BillingCycle } from './entities/price.entity';
import { SubscriptionStatus } from './entities/subscription.entity';
import { DisputeStatus } from './entities/dispute.entity';

describe('PaymentsV2EnhancedService', () => {
  let service: PaymentsV2EnhancedService;
  let merchantRepository: Repository<Merchant>;
  let productRepository: Repository<Product>;
  let priceRepository: Repository<Price>;
  let customerRepository: Repository<Customer>;
  let subscriptionRepository: Repository<Subscription>;
  let disputeRepository: Repository<Dispute>;
  let paymentRepository: Repository<Payment>;
  let checkoutSessionRepository: Repository<CheckoutSession>;
  let webhookEndpointRepository: Repository<WebhookEndpoint>;
  let refundRepository: Repository<Refund>;
  let paymentMethodRepository: Repository<PaymentMethod>;
  let policyService: PolicyService;
  let ledgerService: LedgerService;
  let eventEmitter: EventEmitter2;

  const mockMerchantRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPriceRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCustomerRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSubscriptionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDisputeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPaymentRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCheckoutSessionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockWebhookEndpointRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRefundRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPaymentMethodRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPolicyService = {
    checkPolicy: jest.fn(),
  };

  const mockLedgerService = {
    createJournalEntry: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsV2EnhancedService,
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
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: getRepositoryToken(Dispute),
          useValue: mockDisputeRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(CheckoutSession),
          useValue: mockCheckoutSessionRepository,
        },
        {
          provide: getRepositoryToken(WebhookEndpoint),
          useValue: mockWebhookEndpointRepository,
        },
        {
          provide: getRepositoryToken(Refund),
          useValue: mockRefundRepository,
        },
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: mockPaymentMethodRepository,
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
      ],
    }).compile();

    service = module.get<PaymentsV2EnhancedService>(PaymentsV2EnhancedService);
    merchantRepository = module.get<Repository<Merchant>>(getRepositoryToken(Merchant));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    priceRepository = module.get<Repository<Price>>(getRepositoryToken(Price));
    customerRepository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
    subscriptionRepository = module.get<Repository<Subscription>>(getRepositoryToken(Subscription));
    disputeRepository = module.get<Repository<Dispute>>(getRepositoryToken(Dispute));
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    checkoutSessionRepository = module.get<Repository<CheckoutSession>>(getRepositoryToken(CheckoutSession));
    webhookEndpointRepository = module.get<Repository<WebhookEndpoint>>(getRepositoryToken(WebhookEndpoint));
    refundRepository = module.get<Repository<Refund>>(getRepositoryToken(Refund));
    paymentMethodRepository = module.get<Repository<PaymentMethod>>(getRepositoryToken(PaymentMethod));
    policyService = module.get<PolicyService>(PolicyService);
    ledgerService = module.get<LedgerService>(LedgerService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const dto = {
        orgId: 'org_123',
        name: 'Test Product',
        description: 'Test Description',
        metadata: {},
      };

      const mockProduct = { id: 'prod_123', ...dto };
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(dto, 'user_123');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('createPrice', () => {
    it('should create a price successfully', async () => {
      const dto = {
        productId: 'prod_123',
        amount: '100.00',
        currency: 'NOR',
        billingCycle: BillingCycle.MONTHLY,
      };

      mockProductRepository.findOne.mockResolvedValue({ id: 'prod_123' });
      const mockPrice = { id: 'price_123', ...dto };
      mockPriceRepository.create.mockReturnValue(mockPrice);
      mockPriceRepository.save.mockResolvedValue(mockPrice);

      const result = await service.createPrice(dto, 'user_123');

      expect(result).toEqual(mockPrice);
      expect(mockPriceRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      const dto = {
        productId: 'prod_999',
        amount: '100.00',
        currency: 'NOR',
      };

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.createPrice(dto, 'user_123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCatalog', () => {
    it('should return catalog with products and prices', async () => {
      const mockProducts = [
        { id: 'prod_1', name: 'Product 1', prices: [] },
        { id: 'prod_2', name: 'Product 2', prices: [] },
      ];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.getCatalog('org_123');

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { orgId: 'org_123', active: true },
        relations: ['prices'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('createCustomer', () => {
    it('should create customer with address', async () => {
      const dto = {
        orgId: 'org_123',
        address: '0x1234567890123456789012345678901234567890',
        displayName: 'Test Customer',
      };

      const mockCustomer = { id: 'cust_123', ...dto };
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(dto, 'user_123');

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerRepository.save).toHaveBeenCalled();
    });

    it('should create customer with email', async () => {
      const dto = {
        orgId: 'org_123',
        email: 'test@example.com',
        displayName: 'Test Customer',
      };

      const mockCustomer = { id: 'cust_123', ...dto };
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(dto, 'user_123');

      expect(result).toEqual(mockCustomer);
    });

    it('should throw BadRequestException if neither address nor email provided', async () => {
      const dto = {
        orgId: 'org_123',
        displayName: 'Test Customer',
      };

      await expect(service.createCustomer(dto, 'user_123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createCheckoutSessionV2', () => {
    it('should create checkout session successfully', async () => {
      const dto = {
        orgId: 'org_123',
        lineItems: [{ priceId: 'price_123', quantity: 1 }],
        assetSet: ['NOR'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockMerchant = { id: 'merchant_123', orgId: 'org_123', active: true };
      const mockPrice = { id: 'price_123', amount: '100.00', active: true };
      const mockSession = {
        id: 'session_123',
        sessionId: 'cs_123',
        amount: '100.00',
        ...dto,
      };

      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      mockPriceRepository.findOne.mockResolvedValue(mockPrice);
      mockCheckoutSessionRepository.create.mockReturnValue(mockSession);
      mockCheckoutSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.createCheckoutSessionV2(dto, 'user_123');

      expect(result).toBeDefined();
      expect(result.payUrl).toBeDefined();
      expect(mockCheckoutSessionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if merchant not found', async () => {
      const dto = {
        orgId: 'org_999',
        lineItems: [{ priceId: 'price_123', quantity: 1 }],
        assetSet: ['NOR'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      mockMerchantRepository.findOne.mockResolvedValue(null);

      await expect(service.createCheckoutSessionV2(dto, 'user_123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if price not found', async () => {
      const dto = {
        orgId: 'org_123',
        lineItems: [{ priceId: 'price_999', quantity: 1 }],
        assetSet: ['NOR'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const mockMerchant = { id: 'merchant_123', orgId: 'org_123', active: true };
      mockMerchantRepository.findOne.mockResolvedValue(mockMerchant);
      mockPriceRepository.findOne.mockResolvedValue(null);

      await expect(service.createCheckoutSessionV2(dto, 'user_123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const dto = {
        priceId: 'price_123',
        customerId: 'cust_123',
        prorationPolicy: 'create_proration' as any,
      };

      const mockPrice = {
        id: 'price_123',
        amount: '100.00',
        billingCycle: BillingCycle.MONTHLY,
        active: true,
      };
      const mockCustomer = { id: 'cust_123' };
      const mockSubscription = {
        id: 'sub_123',
        ...dto,
        status: SubscriptionStatus.TRIALING,
      };

      mockPriceRepository.findOne.mockResolvedValue(mockPrice);
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      const result = await service.createSubscription(dto, 'user_123');

      expect(result).toBeDefined();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.created', expect.any(Object));
    });

    it('should throw NotFoundException if price not found', async () => {
      const dto = {
        priceId: 'price_999',
        customerId: 'cust_123',
      };

      mockPriceRepository.findOne.mockResolvedValue(null);

      await expect(service.createSubscription(dto, 'user_123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if price has no billing cycle', async () => {
      const dto = {
        priceId: 'price_123',
        customerId: 'cust_123',
      };

      const mockPrice = {
        id: 'price_123',
        amount: '100.00',
        billingCycle: null,
        active: true,
      };

      mockPriceRepository.findOne.mockResolvedValue(mockPrice);

      await expect(service.createSubscription(dto, 'user_123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
      };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      });

      const result = await service.cancelSubscription('sub_123', 'user_123');

      expect(result.status).toBe(SubscriptionStatus.CANCELED);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('subscription.canceled', expect.any(Object));
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelSubscription('sub_999', 'user_123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createDispute', () => {
    it('should create dispute successfully', async () => {
      const dto = {
        paymentId: 'pay_123',
        reason: 'fraud',
        customerEvidence: {},
      };

      const mockPayment = {
        id: 'payment_123',
        paymentId: 'pay_123',
        merchantId: 'merchant_123',
      };
      const mockDispute = {
        id: 'dispute_123',
        paymentId: mockPayment.id,
        status: DisputeStatus.OPEN,
        ...dto,
      };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockDisputeRepository.findOne.mockResolvedValue(null);
      mockDisputeRepository.create.mockReturnValue(mockDispute);
      mockDisputeRepository.save.mockResolvedValue(mockDispute);

      const result = await service.createDispute(dto, 'user_123');

      expect(result).toBeDefined();
      expect(mockDisputeRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if payment not found', async () => {
      const dto = {
        paymentId: 'pay_999',
        reason: 'fraud',
      };

      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.createDispute(dto, 'user_123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if dispute already exists', async () => {
      const dto = {
        paymentId: 'pay_123',
        reason: 'fraud',
      };

      const mockPayment = {
        id: 'payment_123',
        paymentId: 'pay_123',
      };
      const mockDispute = { id: 'dispute_123' };

      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockDisputeRepository.findOne.mockResolvedValue(mockDispute);

      await expect(service.createDispute(dto, 'user_123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('registerWebhook', () => {
    it('should register webhook endpoint successfully', async () => {
      const mockEndpoint = {
        id: 'webhook_123',
        orgId: 'org_123',
        url: 'https://example.com/webhook',
        hmacSecret: 'secret_123',
        events: ['payment.succeeded'],
        active: true,
      };

      mockWebhookEndpointRepository.create.mockReturnValue(mockEndpoint);
      mockWebhookEndpointRepository.save.mockResolvedValue(mockEndpoint);

      const result = await service.registerWebhook(
        'org_123',
        'https://example.com/webhook',
        ['payment.succeeded'],
        'user_123',
      );

      expect(result).toBeDefined();
      expect(result.hmacSecret).toBeDefined();
      expect(mockWebhookEndpointRepository.save).toHaveBeenCalled();
    });
  });
});
