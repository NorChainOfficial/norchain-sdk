import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PerformanceMonitorService, PerformanceMetric } from './performance-monitor.service';

describe('PerformanceMonitorService', () => {
  let service: PerformanceMonitorService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceMonitorService,
        {
          provide: EventEmitter2,
          useValue: {
            on: jest.fn(),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PerformanceMonitorService>(PerformanceMonitorService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordMetric', () => {
    it('should record a performance metric', () => {
      const metric: PerformanceMetric = {
        endpoint: '/api/test',
        method: 'GET',
        duration: 100,
        statusCode: 200,
        timestamp: new Date(),
      };

      service.recordMetric(metric);

      const stats = service.getStats('/api/test', 'GET');
      expect(stats).toBeDefined();
      expect(stats.requestCount).toBe(1);
    });

    it('should limit metrics to maxMetrics', () => {
      const metric: PerformanceMetric = {
        endpoint: '/api/test',
        method: 'GET',
        duration: 100,
        statusCode: 200,
        timestamp: new Date(),
      };

      // Record more than maxMetrics
      for (let i = 0; i < 10001; i++) {
        service.recordMetric({ ...metric, duration: i });
      }

      const stats = service.getStats('/api/test', 'GET');
      expect(stats.requestCount).toBeLessThanOrEqual(10000);
    });
  });

  describe('getStats', () => {
    it('should return performance stats for endpoint', () => {
      const metric: PerformanceMetric = {
        endpoint: '/api/test',
        method: 'GET',
        duration: 100,
        statusCode: 200,
        timestamp: new Date(),
      };

      service.recordMetric(metric);
      service.recordMetric({ ...metric, duration: 200 });
      service.recordMetric({ ...metric, duration: 300 });

      const stats = service.getStats('/api/test', 'GET');

      expect(stats).toBeDefined();
      expect(stats.endpoint).toBe('/api/test');
      expect(stats.method).toBe('GET');
      expect(stats.requestCount).toBe(3);
      expect(stats.averageDuration).toBe(200);
      expect(stats.minDuration).toBe(100);
      expect(stats.maxDuration).toBe(300);
    });

    it('should return zero stats for non-existent endpoint', () => {
      const stats = service.getStats('/api/nonexistent', 'GET');

      expect(stats.requestCount).toBe(0);
      expect(stats.averageDuration).toBe(0);
    });

    it('should calculate error rate correctly', () => {
      const metric: PerformanceMetric = {
        endpoint: '/api/test',
        method: 'GET',
        duration: 100,
        statusCode: 200,
        timestamp: new Date(),
      };

      service.recordMetric(metric);
      service.recordMetric({ ...metric, statusCode: 500 });
      service.recordMetric({ ...metric, statusCode: 404 });

      const stats = service.getStats('/api/test', 'GET');

      expect(stats.errorRate).toBeCloseTo(0.6667, 2); // 2 out of 3 are errors
    });
  });

  describe('getAllStats', () => {
    it('should return stats for all endpoints', () => {
      const metric1: PerformanceMetric = {
        endpoint: '/api/test1',
        method: 'GET',
        duration: 100,
        statusCode: 200,
        timestamp: new Date(),
      };

      const metric2: PerformanceMetric = {
        endpoint: '/api/test2',
        method: 'POST',
        duration: 200,
        statusCode: 200,
        timestamp: new Date(),
      };

      service.recordMetric(metric1);
      service.recordMetric(metric2);

      const allStats = service.getAllStats();

      expect(allStats.length).toBeGreaterThanOrEqual(2);
      expect(allStats.some((s) => s.endpoint === '/api/test1')).toBe(true);
      expect(allStats.some((s) => s.endpoint === '/api/test2')).toBe(true);
    });
  });

  describe('getAllStats', () => {
    it('should return empty array when no metrics', () => {
      const allStats = service.getAllStats();
      expect(allStats).toEqual([]);
    });
  });
});

