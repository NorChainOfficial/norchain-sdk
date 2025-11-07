import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

describe('StatsService', () => {
  let service: StatsService;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockRpcService = {
      getBlockNumber: jest.fn(),
      getBlock: jest.fn(),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEthSupply', () => {
    it('should return ETH supply', async () => {
      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlockNumber.mockResolvedValue(10000);
        return fn();
      });

      const result = await service.getEthSupply();

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('EthSupply');
      expect(result.result).toHaveProperty('Eth2Staking');
      expect(result.result).toHaveProperty('EthBurntFees');
    });
  });

  describe('getEthPrice', () => {
    it('should return ETH price', async () => {
      cacheService.getOrSet.mockResolvedValue({
        ethbtc: '0.05',
        ethbtc_timestamp: Date.now().toString(),
        ethusd: '2500',
        ethusd_timestamp: Date.now().toString(),
      });

      const result = await service.getEthPrice();

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('ethusd');
      expect(result.result).toHaveProperty('ethbtc');
    });
  });

  describe('getChainSize', () => {
    it('should return chain size statistics', async () => {
      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlockNumber.mockResolvedValue(12345);
        rpcService.getBlock.mockResolvedValue({
          number: 12345,
          hash: '0xabc',
          timestamp: 1234567890,
          gasUsed: BigInt('500000'),
          gasLimit: BigInt('1000000'),
        } as any);
        return fn();
      });

      const result = await service.getChainSize();

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('blockNumber');
      expect(result.result).toHaveProperty('blockTime');
    });
  });

  describe('getNodeCount', () => {
    it('should return node count', async () => {
      cacheService.getOrSet.mockResolvedValue({
        TotalNodeCount: '100',
        SyncNodeCount: '95',
      });

      const result = await service.getNodeCount();

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('TotalNodeCount');
      expect(result.result).toHaveProperty('SyncNodeCount');
    });
  });
});

