import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TokenTransfer } from '@/modules/token/entities/token-transfer.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let transactionRepository: any;
  let tokenTransferRepository: any;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockTransactionRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockTokenTransferRepository = {
      count: jest.fn(),
    };

    const mockRpcService = {
      getBalance: jest.fn(),
      getBlockNumber: jest.fn(),
      getBlock: jest.fn(),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(TokenTransfer),
          useValue: mockTokenTransferRepository,
        },
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

    service = module.get<AnalyticsService>(AnalyticsService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    tokenTransferRepository = module.get(getRepositoryToken(TokenTransfer));
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPortfolioSummary', () => {
    it('should return portfolio summary', async () => {
      const address = '0x123';

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
        transactionRepository.count.mockResolvedValue(10);
        tokenTransferRepository.count.mockResolvedValue(5);
        return fn();
      });

      const result = await service.getPortfolioSummary(address);

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('address');
      expect(result.result).toHaveProperty('nativeBalance');
      expect(result.result).toHaveProperty('transactionStats');
    });
  });

  describe('getTransactionAnalytics', () => {
    it('should return transaction analytics', async () => {
      const address = '0x123';
      const days = 30;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            fromAddress: address,
            toAddress: '0x456',
            value: '1000000000000000000',
            gasUsed: '21000',
            status: 1,
          },
        ]),
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getTransactionAnalytics(address, days);

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('totalTransactions');
      expect(result.result).toHaveProperty('totalSent');
      expect(result.result).toHaveProperty('totalReceived');
      expect(result.result).toHaveProperty('successRate');
    });
  });

  describe('getNetworkStatistics', () => {
    it('should return network statistics', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1000),
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlockNumber = jest.fn().mockResolvedValue(12345);
        transactionRepository.count.mockResolvedValue(50000);
        transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getNetworkStatistics();

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('currentBlock');
      expect(result.result).toHaveProperty('totalTransactions');
    });
  });
});

