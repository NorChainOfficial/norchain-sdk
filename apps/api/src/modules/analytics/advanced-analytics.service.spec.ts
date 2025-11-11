import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Block } from '../block/entities/block.entity';
import { CacheService } from '@/common/services/cache.service';

describe('AdvancedAnalyticsService', () => {
  let service: AdvancedAnalyticsService;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let blockRepository: jest.Mocked<Repository<Block>>;
  let cacheService: jest.Mocked<CacheService>;

  const mockTransactionRepository = {
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };

  const mockBlockRepository = {
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };

  const mockCacheService = {
    getOrSet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvancedAnalyticsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Block),
          useValue: mockBlockRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<AdvancedAnalyticsService>(AdvancedAnalyticsService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    blockRepository = module.get(getRepositoryToken(Block));
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNetworkAnalytics', () => {
    it('should return network analytics with date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1000),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '1000000000000000000000', count: '500', avg: '20000000000' }),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { createdAt: new Date('2025-01-01') },
          { createdAt: new Date('2025-01-02') },
        ]),
      };

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
        mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getNetworkAnalytics(startDate, endDate);

      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('totalVolume');
      expect(result).toHaveProperty('activeAddresses');
      expect(result).toHaveProperty('averageGasPrice');
      expect(result).toHaveProperty('averageBlockTime');
      expect(result).toHaveProperty('topTokens');
      expect(result).toHaveProperty('networkGrowth');
    });

    it('should use default date range when not provided', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '0', count: '0', avg: '0' }),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
        mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getNetworkAnalytics();

      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('totalVolume');
    });

    it('should handle empty results', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
        mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getNetworkAnalytics();

      expect(result.totalTransactions).toBe(0);
      expect(result.totalVolume).toBe('0');
      expect(result.activeAddresses).toBe(0);
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics', async () => {
      const userId = 'user-123';

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });

      const result = await service.getUserAnalytics(userId);

      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('totalVolume');
      expect(result).toHaveProperty('averageTransactionValue');
      expect(result).toHaveProperty('mostActiveDay');
      expect(result).toHaveProperty('topTokens');
    });

    it('should handle user with no transactions', async () => {
      const userId = 'user-123';

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });

      const result = await service.getUserAnalytics(userId);

      expect(result.totalTransactions).toBe(0);
      expect(result.totalVolume).toBe('0');
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should return real-time metrics', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1000),
      };

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
        mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getRealTimeMetrics();

      expect(result).toHaveProperty('transactions24h');
      expect(result).toHaveProperty('blocks24h');
      expect(result).toHaveProperty('tps');
      expect(result).toHaveProperty('bps');
      expect(result).toHaveProperty('timestamp');
    });

    it('should handle zero transactions and blocks', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockCacheService.getOrSet.mockImplementation(async (key, fn) => {
        mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        return fn();
      });

      const result = await service.getRealTimeMetrics();

      expect(result.transactions24h).toBe(0);
      expect(result.blocks24h).toBe(0);
      expect(result.tps).toBe(0);
      expect(result.bps).toBe(0);
    });
  });
});

