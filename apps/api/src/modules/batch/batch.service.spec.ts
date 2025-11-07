import { Test, TestingModule } from '@nestjs/testing';
import { BatchService } from './batch.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

describe('BatchService', () => {
  let service: BatchService;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockRpcService = {
      getBalance: jest.fn(),
      getBlock: jest.fn(),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalancesBatch', () => {
    it('should return balances for multiple addresses', async () => {
      const addresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        '0x8ba1f109551bD432803012645Hac136c22C9299',
      ];

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        const address = key.split(':')[1];
        rpcService.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
        return fn();
      });

      const result = await service.getBalancesBatch(addresses);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      if (result.result) {
        expect(result.result).toHaveLength(2);
        expect(result.result[0]).toHaveProperty('address');
        expect(result.result[0]).toHaveProperty('balance');
      }
    });

    it('should reject if more than 100 addresses', async () => {
      const addresses = Array(101).fill('0x123');

      const result = await service.getBalancesBatch(addresses);

      expect(result.status).toBe('0');
      expect(result.message).toContain('100');
    });
  });

  describe('getTransactionCountsBatch', () => {
    it('should return transaction counts', async () => {
      const addresses = ['0x123', '0x456'];

      const result = await service.getTransactionCountsBatch(addresses);

      expect(result.status).toBe('1');
      expect(result.result).toHaveLength(2);
    });

    it('should reject if more than 50 addresses', async () => {
      const addresses = Array(51).fill('0x123');

      const result = await service.getTransactionCountsBatch(addresses);

      expect(result.status).toBe('0');
      expect(result.message).toContain('50');
    });
  });

  describe('getTokenBalancesBatch', () => {
    it('should return token balances', async () => {
      const requests = [
        { address: '0x123', tokenAddress: '0xtoken1' },
        { address: '0x456', tokenAddress: '0xtoken2' },
      ];

      cacheService.getOrSet.mockResolvedValue({
        address: '0x123',
        tokenAddress: '0xtoken1',
        balance: '1000',
      });

      const result = await service.getTokenBalancesBatch(requests);

      expect(result.status).toBe('1');
      expect(result.result).toHaveLength(2);
    });
  });

  describe('getBlocksBatch', () => {
    it('should return block information', async () => {
      const blockNumbers = [12345, 12346];

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        const blockNumber = parseInt(key.split(':')[1]);
        rpcService.getBlock.mockResolvedValue({
          number: blockNumber,
          hash: '0xabc',
          timestamp: 1234567890,
          gasUsed: BigInt('500000'),
          gasLimit: BigInt('1000000'),
          transactions: [],
        } as any);
        return fn();
      });

      const result = await service.getBlocksBatch(blockNumbers);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      if (result.result) {
        expect(result.result).toHaveLength(2);
      }
    });

    it('should reject if more than 20 blocks', async () => {
      const blockNumbers = Array(21).fill(12345);

      const result = await service.getBlocksBatch(blockNumbers);

      expect(result.status).toBe('0');
      expect(result.message).toContain('20');
    });
  });
});

