import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsV2EnhancedController } from './payments-v2-enhanced.controller';
import { PaymentsV2EnhancedService } from './payments-v2-enhanced.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

describe('PaymentsV2EnhancedController', () => {
  let controller: PaymentsV2EnhancedController;
  let service: PaymentsV2EnhancedService;

  const mockService = {
    createProduct: jest.fn(),
    createPrice: jest.fn(),
    getCatalog: jest.fn(),
    createCustomer: jest.fn(),
    createCheckoutSessionV2: jest.fn(),
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    createDispute: jest.fn(),
    registerWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsV2EnhancedController],
      providers: [
        {
          provide: PaymentsV2EnhancedService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentsV2EnhancedController>(
      PaymentsV2EnhancedController,
    );
    service = module.get<PaymentsV2EnhancedService>(PaymentsV2EnhancedService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const dto = {
        orgId: 'org_123',
        name: 'Premium Subscription',
        description: 'Monthly premium',
      };

      const mockProduct = { id: 'prod_123', ...dto };
      mockService.createProduct.mockResolvedValue(mockProduct);

      const req = { user: { id: 'user_123' } };
      const result = await controller.createProduct(req as any, dto);

      expect(result).toEqual(mockProduct);
      expect(mockService.createProduct).toHaveBeenCalledWith(dto, 'user_123');
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription', async () => {
      const dto = {
        priceId: 'price_123',
        customerId: 'cust_123',
      };

      const mockSubscription = { id: 'sub_123', ...dto };
      mockService.createSubscription.mockResolvedValue(mockSubscription);

      const req = { user: { id: 'user_123' } };
      const result = await controller.createSubscription(req as any, dto);

      expect(result).toEqual(mockSubscription);
      expect(mockService.createSubscription).toHaveBeenCalledWith(dto, 'user_123');
    });
  });
});

