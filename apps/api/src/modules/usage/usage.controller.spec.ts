import { Test, TestingModule } from '@nestjs/testing';
import { UsageController } from './usage.controller';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetUsageAnalyticsDto } from './dto/get-usage-analytics.dto';
import { BillingPeriod } from './entities/usage-billing.entity';

describe('UsageController', () => {
  let controller: UsageController;
  let service: jest.Mocked<UsageService>;

  const mockUsageService = {
    getUsageAnalytics: jest.fn(),
    getCurrentUsage: jest.fn(),
    getBillingHistory: jest.fn(),
    generateBilling: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsageController],
      providers: [
        {
          provide: UsageService,
          useValue: mockUsageService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsageController>(UsageController);
    service = module.get(UsageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsageAnalytics', () => {
    it('should return usage analytics', async () => {
      const dto: GetUsageAnalyticsDto = {};
      const mockResult = {
        totalCalls: 1000,
        totalRpcCalls: 500,
        totalStreamingMinutes: 0,
        totalWebhookDeliveries: 0,
        totalCost: '0.1',
        byEndpoint: [],
      };

      service.getUsageAnalytics.mockResolvedValue(mockResult);

      const result = await controller.getUsageAnalytics(
        { user: { id: 'user-123' } } as any,
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(service.getUsageAnalytics).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('getCurrentUsage', () => {
    it('should return current usage', async () => {
      const mockResult = {
        periodStart: new Date(),
        periodEnd: new Date(),
        calls: 500,
        cost: '0.05',
        limit: 10000,
        remaining: 9500,
      };

      service.getCurrentUsage.mockResolvedValue(mockResult);

      const result = await controller.getCurrentUsage({
        user: { id: 'user-123' },
      } as any);

      expect(result).toEqual(mockResult);
      expect(service.getCurrentUsage).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getBillingHistory', () => {
    it('should return billing history', async () => {
      const mockResult = {
        billings: [],
        total: 0,
      };

      service.getBillingHistory.mockResolvedValue(mockResult);

      const result = await controller.getBillingHistory(
        { user: { id: 'user-123' } } as any,
        50,
        0,
      );

      expect(result).toEqual(mockResult);
      expect(service.getBillingHistory).toHaveBeenCalledWith('user-123', 50, 0);
    });
  });

  describe('generateBilling', () => {
    it('should generate billing', async () => {
      const mockBilling = {
        id: 'billing-123',
        userId: 'user-123',
        period: BillingPeriod.MONTHLY,
        totalCost: '10.5',
      };

      service.generateBilling.mockResolvedValue(mockBilling as any);

      const result = await controller.generateBilling(
        { user: { id: 'user-123' } } as any,
        BillingPeriod.MONTHLY,
      );

      expect(result).toEqual(mockBilling);
      expect(service.generateBilling).toHaveBeenCalledWith(
        'user-123',
        BillingPeriod.MONTHLY,
      );
    });

    it('should use default period when not provided', async () => {
      const mockBilling = {
        id: 'billing-123',
        userId: 'user-123',
        period: BillingPeriod.MONTHLY,
        totalCost: '10.5',
      };

      service.generateBilling.mockResolvedValue(mockBilling as any);

      await controller.generateBilling({ user: { id: 'user-123' } } as any);

      expect(service.generateBilling).toHaveBeenCalledWith(
        'user-123',
        BillingPeriod.MONTHLY,
      );
    });
  });
});

