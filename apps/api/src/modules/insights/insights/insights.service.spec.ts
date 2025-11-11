import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { RpcService } from '@/common/services/rpc.service';

describe('InsightsService', () => {
  let service: InsightsService;
  let rpcService: RpcService;

  const mockProvider = {
    getBalance: jest.fn(),
    getBlockNumber: jest.fn(),
    getBlock: jest.fn(),
    call: jest.fn(),
  };

  const mockRpcService = {
    getProvider: jest.fn(() => mockProvider),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
    rpcService = module.get<RpcService>(RpcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopHolders', () => {
    it('should return top token holders', async () => {
      const tokenAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const limit = 10;

      const result = await service.getTopHolders(tokenAddress, limit);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('token', tokenAddress);
      expect(result).toHaveProperty('holders');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', limit);
    });

    it('should respect limit parameter', async () => {
      const tokenAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const limit = 5;

      const result = await service.getTopHolders(tokenAddress, limit);

      expect(result.limit).toBe(limit);
    });
  });

  describe('getDEXTVL', () => {
    it('should return DEX TVL over time range', async () => {
      const window = '7d';

      const result = await service.getDEXTVL(window);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('range', window);
      expect(result).toHaveProperty('tvl');
      expect(result).toHaveProperty('dataPoints');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('endTime');
    });

    it('should handle different time windows', async () => {
      const windows: Array<'1d' | '7d' | '30d' | '1y'> = ['1d', '7d', '30d', '1y'];

      for (const window of windows) {
        const result = await service.getDEXTVL(window);
        expect(result).toBeDefined();
        expect(result.range).toBe(window);
      }
    });
  });

  describe('getGasHeatmap', () => {
    it('should return gas usage heatmap', async () => {
      const days = 7;

      const result = await service.getGasHeatmap(days);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('days', days);
      expect(result).toHaveProperty('heatmap');
      expect(result).toHaveProperty('averageGasPrice');
      expect(result).toHaveProperty('peakGasPrice');
    });

    it('should handle different day ranges', async () => {
      const days = 30;

      const result = await service.getGasHeatmap(days);

      expect(result).toBeDefined();
      expect(result.days).toBe(days);
    });
  });
});

