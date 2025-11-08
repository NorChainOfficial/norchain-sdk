import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { PrometheusService } from './services/prometheus.service';
import { RpcService } from '@/common/services/rpc.service';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let prometheusService: jest.Mocked<PrometheusService>;
  let rpcService: jest.Mocked<RpcService>;

  beforeEach(async () => {
    const mockPrometheusService = {
      getMetrics: jest.fn(),
    };
    const mockRpcService = {
      getBlockNumber: jest.fn(),
      getFeeData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: PrometheusService,
          useValue: mockPrometheusService,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    prometheusService = module.get(PrometheusService);
    rpcService = module.get(RpcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return healthy status', async () => {
      const blockNumber = 12345;
      rpcService.getBlockNumber.mockResolvedValue(blockNumber);

      const result = await service.getHealth();

      expect(result.status).toBe('healthy');
      expect(result.blockNumber).toBe(`0x${blockNumber.toString(16)}`);
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(rpcService.getBlockNumber).toHaveBeenCalled();
    });

    it('should return unhealthy status on error', async () => {
      const error = new Error('RPC connection failed');
      rpcService.getBlockNumber.mockRejectedValue(error);

      const result = await service.getHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBe(error.message);
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('getStats', () => {
    it('should return node statistics', async () => {
      const blockNumber = 12345;
      const gasPrice = BigInt('1000000000');
      rpcService.getBlockNumber.mockResolvedValue(blockNumber);
      rpcService.getFeeData.mockResolvedValue({
        gasPrice,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        toJSON: () => ({}),
      } as any);

      const result = await service.getStats();

      expect(result.currentBlock).toBe(`0x${blockNumber.toString(16)}`);
      expect(result.gasPrice).toBe(`0x${gasPrice.toString(16)}`);
      expect(result).toHaveProperty('blocksPerSecond');
      expect(result).toHaveProperty('txpoolSize');
      expect(result).toHaveProperty('cpuUsage');
      expect(result).toHaveProperty('memoryUsage');
      expect(rpcService.getBlockNumber).toHaveBeenCalled();
      expect(rpcService.getFeeData).toHaveBeenCalled();
    });

    it('should handle missing gas price', async () => {
      const blockNumber = 12345;
      rpcService.getBlockNumber.mockResolvedValue(blockNumber);
      rpcService.getFeeData.mockResolvedValue({
        gasPrice: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        toJSON: () => ({}),
      } as any);

      const result = await service.getStats();

      expect(result.gasPrice).toBe('0x0');
    });

    it('should throw error on failure', async () => {
      const error = new Error('Stats retrieval failed');
      rpcService.getBlockNumber.mockRejectedValue(error);

      await expect(service.getStats()).rejects.toThrow(error);
    });
  });
});

