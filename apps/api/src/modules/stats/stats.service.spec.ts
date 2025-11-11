import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('StatsService', () => {
  let service: StatsService;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockRpcService = {
      getBlockNumber: jest.fn(),
      getBlock: jest.fn(),
      getBalance: jest.fn(),
      call: jest.fn(),
      getFeeData: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      getOrSet: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEthSupply', () => {
    it('should return ETH supply stats', async () => {
      const supply = {
        EthSupply: '1000000',
        Eth2Staking: '0',
        EthBurntFees: '0',
      };

      cacheService.getOrSet.mockResolvedValue(supply);

      const result = await service.getEthSupply();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toEqual(supply);
    });
  });

  describe('getEthPrice', () => {
    it('should return ETH price stats', async () => {
      const price = {
        ethbtc: '0.05',
        ethbtc_timestamp: '1234567890',
        ethusd: '2000',
        ethusd_timestamp: '1234567890',
      };

      cacheService.getOrSet.mockResolvedValue(price);

      const result = await service.getEthPrice();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toEqual(price);
    });
  });

  describe('getChainSize', () => {
    it('should return chain size stats', async () => {
      const chainSize = {
        chainSize: '1000',
        chainSizeFees: '500',
        blockNumber: '12345',
        blockTime: '2024-01-01T00:00:00Z',
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlockNumber.mockResolvedValue(12345);
        rpcService.getBlock.mockResolvedValue({
          timestamp: 1234567890,
          toJSON: jest.fn(),
        } as any);
        return fn();
      });

      const result = await service.getChainSize();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
    });
  });

  describe('getNodeCount', () => {
    it('should return node count stats', async () => {
      const nodeCount = {
        TotalNodeCount: '10',
        SyncNodeCount: '8',
      };

      cacheService.getOrSet.mockResolvedValue(nodeCount);

      const result = await service.getNodeCount();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toEqual(nodeCount);
    });
  });

  describe('getEthSupply', () => {
    it('should calculate supply from block number', async () => {
      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlockNumber.mockResolvedValue(1000);
        return fn();
      });

      const result = await service.getEthSupply();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('EthSupply');
      expect(result.result).toHaveProperty('Eth2Staking');
      expect(result.result).toHaveProperty('EthBurntFees');
      expect(rpcService.getBlockNumber).toHaveBeenCalled();
    });
  });

  describe('getChainSize', () => {
    it('should handle missing block timestamp', async () => {
      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlockNumber.mockResolvedValue(12345);
        rpcService.getBlock.mockResolvedValue(null);
        return fn();
      });

      const result = await service.getChainSize();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result.blockTime).toBe('0');
    });
  });
});
