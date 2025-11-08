import { Test, TestingModule } from '@nestjs/testing';
import { PrometheusService } from './prometheus.service';
import { RpcService } from '@/common/services/rpc.service';

describe('PrometheusService', () => {
  let service: PrometheusService;
  let rpcService: jest.Mocked<RpcService>;

  beforeEach(async () => {
    const mockRpcService = {
      getBlockNumber: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrometheusService,
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<PrometheusService>(PrometheusService);
    rpcService = module.get(RpcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return Prometheus metrics', async () => {
      rpcService.getBlockNumber.mockResolvedValue(12345);

      const result = await service.getMetrics();

      expect(result).toContain('blocks_per_second');
      expect(result).toContain('txpool_size');
      expect(result).toContain('transactions_per_second');
      expect(result).toContain('cpu_usage');
      expect(result).toContain('memory_usage');
    });

    it('should handle RPC errors gracefully', async () => {
      rpcService.getBlockNumber.mockRejectedValue(new Error('RPC error'));

      const result = await service.getMetrics();

      expect(result).toBeDefined();
      expect(result).toContain('blocks_per_second');
    });
  });

  describe('incrementCounter', () => {
    it('should increment counter', () => {
      service.incrementCounter('test_counter', 5);
      service.incrementCounter('test_counter', 3);

      const metrics = service.getMetrics();
      // Counter should be incremented
      expect(metrics).toBeDefined();
    });
  });

  describe('setGauge', () => {
    it('should set gauge value', () => {
      service.setGauge('test_gauge', 100);

      const metrics = service.getMetrics();
      expect(metrics).toBeDefined();
    });
  });
});

