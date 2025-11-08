import { Test, TestingModule } from '@nestjs/testing';
import { BatchService } from './batch.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('BatchService', () => {
  let service: BatchService;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockRpcService = {
      getBalance: jest.fn(),
      getTransactionCount: jest.fn(),
      getBlock: jest.fn(),
      call: jest.fn(),
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
        BatchService,
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

    service = module.get<BatchService>(BatchService);
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalancesBatch', () => {
    it('should return balances for multiple addresses', async () => {
      const addresses = [
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ];

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
        return fn();
      });

      const result = await service.getBalancesBatch(addresses);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(Array.isArray(result.result)).toBe(true);
      expect(result.result).toHaveLength(2);
      expect(rpcService.getBalance).toHaveBeenCalledTimes(2);
    });

    it('should reject if more than 100 addresses', async () => {
      const addresses = Array(101).fill('0xdAC17F958D2ee523a2206206994597C13D831ec7');

      const result = await service.getBalancesBatch(addresses);

      expect(result.status).toBe('0');
      expect(result.message).toContain('Maximum 100');
    });
  });

  describe('getTransactionCountsBatch', () => {
    it('should return transaction counts for multiple addresses', async () => {
      const addresses = [
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ];

      const result = await service.getTransactionCountsBatch(addresses);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(Array.isArray(result.result)).toBe(true);
      expect(result.result).toHaveLength(2);
    });

    it('should reject if more than 50 addresses', async () => {
      const addresses = Array(51).fill('0xdAC17F958D2ee523a2206206994597C13D831ec7');

      const result = await service.getTransactionCountsBatch(addresses);

      expect(result.status).toBe('0');
      expect(result.message).toContain('Maximum 50');
    });
  });

  describe('getTokenBalancesBatch', () => {
    it('should return token balances for multiple pairs', async () => {
      const requests = [
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        },
      ];

      cacheService.getOrSet.mockResolvedValue({
        address: requests[0].address,
        tokenAddress: requests[0].tokenAddress,
        balance: '1000',
      });

      const result = await service.getTokenBalancesBatch(requests);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(Array.isArray(result.result)).toBe(true);
    });

    it('should reject if more than 50 requests', async () => {
      const requests = Array(51).fill({
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      });

      const result = await service.getTokenBalancesBatch(requests);

      expect(result.status).toBe('0');
      expect(result.message).toContain('Maximum 50');
    });
  });

  describe('getBlocksBatch', () => {
    it('should return blocks for multiple block numbers', async () => {
      const blockNumbers = [12345, 12346];

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlock.mockResolvedValue({
          number: 12345,
          hash: '0xabc',
          timestamp: 1234567890,
          gasUsed: BigInt('500000'),
          gasLimit: BigInt('1000000'),
          transactions: [],
          toJSON: jest.fn(),
        } as any);
        return fn();
      });

      const result = await service.getBlocksBatch(blockNumbers);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(Array.isArray(result.result)).toBe(true);
      expect(result.result).toHaveLength(2);
    });

    it('should reject if more than 20 block numbers', async () => {
      const blockNumbers = Array(21).fill(12345);

      const result = await service.getBlocksBatch(blockNumbers);

      expect(result.status).toBe('0');
      expect(result.message).toContain('Maximum 20');
    });
  });
});
