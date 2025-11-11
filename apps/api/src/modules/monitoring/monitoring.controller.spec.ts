import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { PerformanceMonitorService } from './performance-monitor.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let performanceMonitorService: jest.Mocked<PerformanceMonitorService>;

  beforeEach(async () => {
    const mockPerformanceMonitorService = {
      getAllStats: jest.fn(),
      getHealthMetrics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        {
          provide: PerformanceMonitorService,
          useValue: mockPerformanceMonitorService,
        },
      ],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
    performanceMonitorService = module.get(PerformanceMonitorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPerformanceStats', () => {
    it('should return performance statistics', async () => {
      const mockStats = [
        {
          endpoint: '/api/test',
          method: 'GET',
          requestCount: 10,
          averageDuration: 50,
          minDuration: 20,
          maxDuration: 100,
          errorRate: 0,
          p50: 50,
          p95: 95,
          p99: 99,
        },
      ];
      performanceMonitorService.getAllStats.mockReturnValue(mockStats);

      const result = await controller.getPerformanceStats(3600000);

      expect(result).toEqual(mockStats);
      expect(performanceMonitorService.getAllStats).toHaveBeenCalledWith(3600000);
    });
  });

  describe('getHealthMetrics', () => {
    it('should return health metrics', async () => {
      const mockHealth = {
        totalRequests: 100,
        errors: 2,
        errorRate: 0.02,
        averageResponseTime: 50,
        requestsPerSecond: 0.33,
        timestamp: new Date().toISOString(),
      };
      performanceMonitorService.getHealthMetrics.mockReturnValue(mockHealth);

      const result = await controller.getHealthMetrics();

      expect(result).toEqual(mockHealth);
      expect(performanceMonitorService.getHealthMetrics).toHaveBeenCalled();
    });
  });
});
