import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PrometheusService } from './services/prometheus.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let monitoringService: jest.Mocked<MonitoringService>;
  let prometheusService: jest.Mocked<PrometheusService>;

  beforeEach(async () => {
    const mockMonitoringService = {
      getHealth: jest.fn(),
      getStats: jest.fn(),
    };
    const mockPrometheusService = {
      getMetrics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        {
          provide: MonitoringService,
          useValue: mockMonitoringService,
        },
        {
          provide: PrometheusService,
          useValue: mockPrometheusService,
        },
      ],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
    monitoringService = module.get(MonitoringService);
    prometheusService = module.get(PrometheusService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return Prometheus metrics', async () => {
      const mockMetrics = '# HELP blocks_per_second Blocks produced per second\nblocks_per_second 0.33\n';
      prometheusService.getMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getMetrics();

      expect(result).toBe(mockMetrics);
      expect(prometheusService.getMetrics).toHaveBeenCalled();
    });
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: Date.now(),
        blockNumber: '0x123',
        uptime: 1000,
      };
      monitoringService.getHealth.mockResolvedValue(mockHealth);

      const result = await controller.getHealth();

      expect(result).toEqual(mockHealth);
      expect(monitoringService.getHealth).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return node statistics', async () => {
      const mockStats = {
        blocksPerSecond: 0.33,
        txpoolSize: 0,
        cpuUsage: { user: 1000, system: 500 } as NodeJS.CpuUsage,
        memoryUsage: { heapUsed: 1000000 } as NodeJS.MemoryUsage,
        currentBlock: '0x123',
        gasPrice: '0x3b9aca00',
      };
      monitoringService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(monitoringService.getStats).toHaveBeenCalled();
    });
  });
});

