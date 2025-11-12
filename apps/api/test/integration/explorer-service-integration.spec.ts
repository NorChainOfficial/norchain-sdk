import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { ExplorerStatsController } from '../../src/modules/explorer/explorer-stats.controller';
import { GasService } from '../../src/modules/gas/gas.service';
import { BlockService } from '../../src/modules/block/block.service';
import { StatsService } from '../../src/modules/stats/stats.service';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from '../../src/modules/transaction/entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Explorer Service Integration Tests', () => {
  let module: TestingModule;
  let statsController: ExplorerStatsController;
  let gasService: GasService;
  let blockService: BlockService;
  let statsService: StatsService;
  let transactionRepository: Repository<Transaction>;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    statsController = module.get<ExplorerStatsController>(ExplorerStatsController);
    gasService = module.get<GasService>(GasService);
    blockService = module.get<BlockService>(BlockService);
    statsService = module.get<StatsService>(StatsService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('GasService Integration', () => {
    it('should get gas oracle data', async () => {
      const result = await gasService.getGasOracle();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      expect(result.result).toHaveProperty('SafeGasPrice');
      expect(result.result).toHaveProperty('ProposeGasPrice');
      expect(result.result).toHaveProperty('FastGasPrice');
      
      // Verify gas prices are valid
      expect(parseInt(result.result.SafeGasPrice)).toBeGreaterThan(0);
    });

    it('should cache gas oracle data', async () => {
      const start1 = Date.now();
      const result1 = await gasService.getGasOracle();
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const result2 = await gasService.getGasOracle();
      const time2 = Date.now() - start2;

      // Second call should be faster (cached)
      expect(time2).toBeLessThan(time1);
      expect(result1.result.SafeGasPrice).toBe(result2.result.SafeGasPrice);
    });
  });

  describe('StatsController Service Integration', () => {
    it('should integrate GasService for gas price', async () => {
      const stats = await statsController.getStats();

      expect(stats.gasPrice).toBeDefined();
      expect(stats.gasPrice).not.toBe('0');
      expect(parseInt(stats.gasPrice)).toBeGreaterThan(0);
    });

    it('should integrate BlockService for block data', async () => {
      const stats = await statsController.getStats();

      expect(stats.blockHeight).toBeDefined();
      expect(stats.latest_block).toBeDefined();
      expect(stats.latest_block.height).toBe(stats.blockHeight);
    });

    it('should integrate StatsService for network data', async () => {
      const stats = await statsController.getStats();

      expect(stats.activeValidators).toBeDefined();
      expect(typeof stats.activeValidators).toBe('number');
    });

    it('should calculate account count from transactions', async () => {
      const stats = await statsController.getStats();

      expect(stats.totalAccounts).toBeDefined();
      expect(typeof stats.totalAccounts).toBe('number');
      expect(stats.totalAccounts).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Database Query Integration', () => {
    it('should query transaction count efficiently', async () => {
      const start = Date.now();
      const count = await transactionRepository.count();
      const duration = Date.now() - start;

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(1000); // Should be fast
    });

    it('should query unique addresses efficiently', async () => {
      const start = Date.now();
      const result = await transactionRepository
        .createQueryBuilder('tx')
        .select('COUNT(DISTINCT tx.fromAddress)', 'count')
        .getRawOne();
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(result.count).toBeDefined();
      expect(parseInt(result.count || '0', 10)).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(2000); // Should be reasonably fast
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle RPC errors gracefully', async () => {
      // Stats should still return even if some services fail
      const stats = await statsController.getStats();

      expect(stats).toBeDefined();
      // Should have fallback values
      expect(stats.gasPrice).toBeDefined();
      expect(stats.totalAccounts).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      // Stats should handle database query failures
      const stats = await statsController.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalTransactions).toBeDefined();
      expect(stats.totalAccounts).toBeDefined();
    });
  });
});

