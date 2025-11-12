import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageService } from './usage.service';
import { ApiUsage, UsageType } from './entities/api-usage.entity';
import { UsageBilling, BillingPeriod, BillingStatus } from './entities/usage-billing.entity';
import { GetUsageAnalyticsDto } from './dto/get-usage-analytics.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';

describe('UsageService', () => {
  let service: UsageService;
  let usageRepository: Repository<ApiUsage>;
  let billingRepository: Repository<UsageBilling>;
  let eventEmitter: EventEmitter2;

  const mockUsageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockBillingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageService,
        {
          provide: getRepositoryToken(ApiUsage),
          useValue: mockUsageRepository,
        },
        {
          provide: getRepositoryToken(UsageBilling),
          useValue: mockBillingRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<UsageService>(UsageService);
    usageRepository = module.get<Repository<ApiUsage>>(getRepositoryToken(ApiUsage));
    billingRepository = module.get<Repository<UsageBilling>>(getRepositoryToken(UsageBilling));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordUsage', () => {
    it('should record API usage', async () => {
      const userId = 'user-123';
      const endpoint = '/api/v1/account/balance';
      const method = 'GET';

      const mockUsage = {
        id: 'usage-123',
        userId,
        endpoint,
        method,
        type: UsageType.API_CALL,
        count: 1,
        cost: '0.0001',
        timestamp: new Date(),
      };

      mockUsageRepository.create.mockReturnValue(mockUsage);
      mockUsageRepository.save.mockResolvedValue(mockUsage);

      const result = await service.recordUsage(userId, endpoint, method);

      expect(result).toEqual(mockUsage);
      expect(mockUsageRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('usage.recorded', expect.any(Object));
    });

    it('should record usage with API key', async () => {
      const userId = 'user-123';
      const endpoint = '/api/v1/account/balance';
      const method = 'GET';
      const apiKeyId = 'key-123';

      const mockUsage = {
        id: 'usage-123',
        userId,
        apiKeyId,
        endpoint,
        method,
        type: UsageType.API_CALL,
        count: 1,
        cost: '0.0001',
      };

      mockUsageRepository.create.mockReturnValue(mockUsage);
      mockUsageRepository.save.mockResolvedValue(mockUsage);

      const result = await service.recordUsage(userId, endpoint, method, UsageType.API_CALL, {
        apiKeyId,
      });

      expect(result.apiKeyId).toBe(apiKeyId);
    });
  });

  describe('getUsageAnalytics', () => {
    it('should return usage analytics', async () => {
      const userId = 'user-123';
      const dto: GetUsageAnalyticsDto = {};

      const mockUsage = [
        {
          id: 'usage-1',
          userId,
          endpoint: '/api/v1/account/balance',
          type: UsageType.API_CALL,
          count: 10,
          cost: '0.001',
          timestamp: new Date(),
        },
        {
          id: 'usage-2',
          userId,
          endpoint: '/api/v1/account/balance',
          type: UsageType.API_CALL,
          count: 5,
          cost: '0.0005',
          timestamp: new Date(),
        },
      ];

      mockUsageRepository.find.mockResolvedValue(mockUsage);

      const result = await service.getUsageAnalytics(userId, dto);

      expect(result.totalCalls).toBe(15);
      expect(result.totalCost).toBeDefined();
      expect(result.byEndpoint).toHaveLength(1);
      expect(result.byEndpoint[0].calls).toBe(15);
    });

    it('should filter by date range', async () => {
      const userId = 'user-123';
      const dto: GetUsageAnalyticsDto = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };

      mockUsageRepository.find.mockResolvedValue([]);

      await service.getUsageAnalytics(userId, dto);

      expect(mockUsageRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId,
          timestamp: expect.any(Object),
        }),
      });
    });

    it('should group by day when requested', async () => {
      const userId = 'user-123';
      const dto: GetUsageAnalyticsDto = {
        groupBy: BillingPeriod.DAILY,
      };

      const mockUsage = [
        {
          id: 'usage-1',
          userId,
          endpoint: '/api/v1/account/balance',
          type: UsageType.API_CALL,
          count: 10,
          cost: '0.001',
          timestamp: new Date('2024-01-01'),
        },
        {
          id: 'usage-2',
          userId,
          endpoint: '/api/v1/account/balance',
          type: UsageType.API_CALL,
          count: 5,
          cost: '0.0005',
          timestamp: new Date('2024-01-02'),
        },
      ];

      mockUsageRepository.find.mockResolvedValue(mockUsage);

      const result = await service.getUsageAnalytics(userId, dto);

      expect(result.byDay).toBeDefined();
      expect(result.byDay?.length).toBeGreaterThan(0);
    });
  });

  describe('generateBilling', () => {
    it('should generate billing for period', async () => {
      const userId = 'user-123';
      const period = BillingPeriod.MONTHLY;

      const mockUsage = [
        {
          id: 'usage-1',
          userId,
          type: UsageType.API_CALL,
          count: 1000,
          cost: '0.1',
          timestamp: new Date(),
        },
      ];

      const mockBilling = {
        id: 'billing-123',
        userId,
        period,
        totalCalls: 1000,
        totalCost: '0.1',
        status: BillingStatus.PENDING,
      };

      mockBillingRepository.findOne.mockResolvedValue(null); // No existing billing
      mockUsageRepository.find.mockResolvedValue(mockUsage);
      mockBillingRepository.create.mockReturnValue(mockBilling);
      mockBillingRepository.save.mockResolvedValue(mockBilling);

      const result = await service.generateBilling(userId, period);

      expect(result).toEqual(mockBilling);
      expect(mockBillingRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('billing.generated', expect.any(Object));
    });

    it('should throw BadRequestException if billing already processed', async () => {
      const userId = 'user-123';
      const period = BillingPeriod.MONTHLY;

      const existingBilling = {
        id: 'billing-123',
        status: BillingStatus.PROCESSED,
      };

      mockBillingRepository.findOne.mockResolvedValue(existingBilling);

      await expect(
        service.generateBilling(userId, period),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBillingHistory', () => {
    it('should return billing history', async () => {
      const userId = 'user-123';
      const mockBillings = [
        {
          id: 'billing-1',
          userId,
          totalCost: '10.5',
        },
        {
          id: 'billing-2',
          userId,
          totalCost: '15.2',
        },
      ];

      mockBillingRepository.findAndCount.mockResolvedValue([mockBillings, 2]);

      const result = await service.getBillingHistory(userId, 50, 0);

      expect(result.billings).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('getCurrentUsage', () => {
    it('should return current period usage', async () => {
      const userId = 'user-123';
      const mockUsage = [
        {
          id: 'usage-1',
          userId,
          type: UsageType.API_CALL,
          count: 500,
          cost: '0.05',
          timestamp: new Date(),
        },
      ];

      mockUsageRepository.find.mockResolvedValue(mockUsage);

      const result = await service.getCurrentUsage(userId);

      expect(result.calls).toBe(500);
      expect(result.cost).toBeDefined();
      expect(result.limit).toBeDefined();
      expect(result.remaining).toBeDefined();
    });
  });
});

