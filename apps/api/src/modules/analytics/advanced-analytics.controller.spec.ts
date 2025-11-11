import { Test, TestingModule } from '@nestjs/testing';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { AdvancedAnalyticsService } from './advanced-analytics.service';

describe('AdvancedAnalyticsController', () => {
  let controller: AdvancedAnalyticsController;
  let analyticsService: jest.Mocked<AdvancedAnalyticsService>;

  const mockAnalyticsService = {
    getNetworkAnalytics: jest.fn(),
    getUserAnalytics: jest.fn(),
    getRealTimeMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvancedAnalyticsController],
      providers: [
        {
          provide: AdvancedAnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AdvancedAnalyticsController>(AdvancedAnalyticsController);
    analyticsService = module.get(AdvancedAnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNetworkAnalytics', () => {
    it('should return network analytics with date range', async () => {
      const startDate = '2025-01-01T00:00:00Z';
      const endDate = '2025-01-31T23:59:59Z';

      const mockResult = {
        totalTransactions: 1000000,
        totalValue: '1000000000000000000000000',
        activeAddresses: 50000,
        networkGrowth: 10.5,
      };

      mockAnalyticsService.getNetworkAnalytics.mockResolvedValue(mockResult);

      const result = await controller.getNetworkAnalytics(startDate, endDate);

      expect(result).toEqual(mockResult);
      expect(analyticsService.getNetworkAnalytics).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate),
      );
    });

    it('should handle undefined dates', async () => {
      const mockResult = {
        totalTransactions: 1000000,
        totalValue: '1000000000000000000000000',
        activeAddresses: 50000,
        networkGrowth: 10.5,
      };

      mockAnalyticsService.getNetworkAnalytics.mockResolvedValue(mockResult);

      await controller.getNetworkAnalytics(undefined, undefined);

      expect(analyticsService.getNetworkAnalytics).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should handle only start date', async () => {
      const startDate = '2025-01-01T00:00:00Z';
      const mockResult = {
        totalTransactions: 1000000,
        totalValue: '1000000000000000000000000',
        activeAddresses: 50000,
        networkGrowth: 10.5,
      };

      mockAnalyticsService.getNetworkAnalytics.mockResolvedValue(mockResult);

      await controller.getNetworkAnalytics(startDate, undefined);

      expect(analyticsService.getNetworkAnalytics).toHaveBeenCalledWith(
        new Date(startDate),
        undefined,
      );
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user-specific analytics', async () => {
      const userId = 'user-123';
      const mockResult = {
        userId,
        totalTransactions: 100,
        totalValue: '1000000000000000000000',
        portfolioValue: '5000000000000000000000',
        topTokens: [],
      };

      mockAnalyticsService.getUserAnalytics.mockResolvedValue(mockResult);

      const result = await controller.getUserAnalytics({ user: { id: userId } });

      expect(result).toEqual(mockResult);
      expect(analyticsService.getUserAnalytics).toHaveBeenCalledWith(userId);
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should return real-time network metrics', async () => {
      const mockResult = {
        currentBlock: 12345,
        tps: 10.5,
        pendingTransactions: 100,
        networkHashrate: '1000000000',
      };

      mockAnalyticsService.getRealTimeMetrics.mockResolvedValue(mockResult);

      const result = await controller.getRealTimeMetrics();

      expect(result).toEqual(mockResult);
      expect(analyticsService.getRealTimeMetrics).toHaveBeenCalled();
    });
  });
});

