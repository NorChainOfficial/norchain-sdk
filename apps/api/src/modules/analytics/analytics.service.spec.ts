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
        transactionRepository.count
          .mockResolvedValueOnce(10) // sentCount
          .mockResolvedValueOnce(5); // receivedCount
        tokenTransferRepository.count.mockResolvedValue(5);
        return fn();
      });

      const result = await service.getPortfolioSummary(address);

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('address', address);
      expect(result.result).toHaveProperty('nativeBalance');
      expect(result.result).toHaveProperty('transactionStats');
      expect(result.result.transactionStats).toHaveProperty('sent', 10);
      expect(result.result.transactionStats).toHaveProperty('received', 5);
      expect(result.result.transactionStats).toHaveProperty('total', 15);
    });

    it('should handle zero balance', async () => {
      const address = '0x123';

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBalance.mockResolvedValue(BigInt('0'));
        transactionRepository.count
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        tokenTransferRepository.count.mockResolvedValue(0);
        return fn();
      });

      const result = await service.getPortfolioSummary(address);

      expect(result.status).toBe('1');
      expect(result.result.nativeBalance).toBe('0');
      expect(result.result.transactionStats.total).toBe(0);
    });

    it('should use cache when available', async () => {
      const address = '0x123';
      const cachedResult = {
        address,
        nativeBalance: '1000000000000000000',
        transactionStats: { sent: 10, received: 5, total: 15 },
      };

      cacheService.getOrSet.mockResolvedValue(cachedResult);

      const result = await service.getPortfolioSummary(address);

      expect(result.result).toEqual(cachedResult);
      expect(rpcService.getBalance).not.toHaveBeenCalled();
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
      expect(result.result).toHaveProperty('totalTransactions', 1);
      expect(result.result).toHaveProperty('totalSent');
      expect(result.result).toHaveProperty('totalReceived');
      expect(result.result).toHaveProperty('successRate', '100.00');
      expect(result.result).toHaveProperty('period', '30 days');
    });

    it('should handle empty transactions', async () => {
      const address = '0x123';
      const days = 30;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getTransactionAnalytics(address, days);

      expect(result.status).toBe('1');
      expect(result.result.totalTransactions).toBe(0);
      expect(result.result.successRate).toBe('0');
      expect(result.result.averageGasPerTx).toBe('0');
    });

    it('should calculate net flow correctly', async () => {
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
          {
            fromAddress: '0x789',
            toAddress: address,
            value: '2000000000000000000',
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

      expect(result.result.netFlow).toBe('1000000000000000000'); // received - sent
    });

    it('should handle different days values', async () => {
      const address = '0x123';
      const days = 7;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getTransactionAnalytics(address, days);

      expect(result.result.period).toBe('7 days');
    });
  });

  describe('getNetworkStatistics', () => {
    it('should return network statistics', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1000),
      };

      const mockBlock = {
        timestamp: 1234567890,
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlockNumber = jest.fn().mockResolvedValue(12345);
        rpcService.getBlock = jest.fn().mockResolvedValue(mockBlock);
        transactionRepository.count.mockResolvedValue(50000);
        transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getNetworkStatistics();

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('currentBlock', 12345);
      expect(result.result).toHaveProperty('totalTransactions', 50000);
      expect(result.result).toHaveProperty('recentTransactionCount', 1000);
      expect(result.result).toHaveProperty('blockTime', 1234567890);
    });

    it('should handle missing block', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlockNumber = jest.fn().mockResolvedValue(0);
        rpcService.getBlock = jest.fn().mockResolvedValue(null);
        transactionRepository.count.mockResolvedValue(0);
        transactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getNetworkStatistics();

      expect(result.result.blockTime).toBe(0);
    });
  });
});

