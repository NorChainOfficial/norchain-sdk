import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Block } from '../block/entities/block.entity';
import { CacheService } from '@/common/services/cache.service';

export interface AnalyticsMetrics {
  totalTransactions: number;
  totalVolume: string;
  activeAddresses: number;
  averageGasPrice: string;
  averageBlockTime: number;
  topTokens: Array<{ address: string; volume: string; txCount: number }>;
  networkGrowth: Array<{ date: string; blocks: number; transactions: number }>;
}

export interface UserAnalytics {
  userId: string;
  totalTransactions: number;
  totalVolume: string;
  averageTransactionValue: string;
  mostActiveDay: string;
  topTokens: Array<{ address: string; balance: string }>;
}

@Injectable()
export class AdvancedAnalyticsService {
  private readonly logger = new Logger(AdvancedAnalyticsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Get comprehensive network analytics
   */
  async getNetworkAnalytics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AnalyticsMetrics> {
    const cacheKey = `analytics:network:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'all'}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const start =
          startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days
        const end = endDate || new Date();

        // Total transactions
        const totalTransactions = await this.transactionRepository
          .createQueryBuilder('tx')
          .where('tx.createdAt >= :start', { start })
          .andWhere('tx.createdAt <= :end', { end })
          .getCount();

        // Total volume
        const volumeResult = await this.transactionRepository
          .createQueryBuilder('tx')
          .select('SUM(tx.value)', 'total')
          .where('tx.createdAt >= :start', { start })
          .andWhere('tx.createdAt <= :end', { end })
          .getRawOne();
        const totalVolume = volumeResult?.total || '0';

        // Active addresses (unique from/to addresses)
        const activeAddressesResult = await this.transactionRepository
          .createQueryBuilder('tx')
          .select('COUNT(DISTINCT tx.from)', 'count')
          .where('tx.createdAt >= :start', { start })
          .andWhere('tx.createdAt <= :end', { end })
          .getRawOne();
        const activeAddresses = parseInt(
          activeAddressesResult?.count || '0',
          10,
        );

        // Average gas price
        const gasPriceResult = await this.transactionRepository
          .createQueryBuilder('tx')
          .select('AVG(tx.gasPrice)', 'avg')
          .where('tx.createdAt >= :start', { start })
          .andWhere('tx.createdAt <= :end', { end })
          .getRawOne();
        const averageGasPrice = gasPriceResult?.avg || '0';

        // Average block time (seconds)
        const blocks = await this.blockRepository
          .createQueryBuilder('block')
          .where('block.createdAt >= :start', { start })
          .andWhere('block.createdAt <= :end', { end })
          .orderBy('block.createdAt', 'ASC')
          .take(100)
          .getMany();
        let averageBlockTime = 0;
        if (blocks.length > 1) {
          const timeDiffs = [];
          for (let i = 1; i < blocks.length; i++) {
            const diff =
              blocks[i].createdAt.getTime() - blocks[i - 1].createdAt.getTime();
            timeDiffs.push(diff / 1000); // Convert to seconds
          }
          averageBlockTime =
            timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        }

        // Top tokens (simplified - would need token transfer aggregation)
        const topTokens: AnalyticsMetrics['topTokens'] = [];

        // Network growth (daily aggregation)
        const networkGrowth: AnalyticsMetrics['networkGrowth'] = [];
        const days = Math.ceil(
          (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
        );
        for (let i = 0; i < days; i++) {
          const dayStart = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

          const dayBlocks = await this.blockRepository
            .createQueryBuilder('block')
            .where('block.createdAt >= :dayStart', { dayStart })
            .andWhere('block.createdAt < :dayEnd', { dayEnd })
            .getCount();

          const dayTxs = await this.transactionRepository
            .createQueryBuilder('tx')
            .where('tx.createdAt >= :dayStart', { dayStart })
            .andWhere('tx.createdAt < :dayEnd', { dayEnd })
            .getCount();

          networkGrowth.push({
            date: dayStart.toISOString().split('T')[0],
            blocks: dayBlocks,
            transactions: dayTxs,
          });
        }

        return {
          totalTransactions,
          totalVolume,
          activeAddresses,
          averageGasPrice,
          averageBlockTime,
          topTokens,
          networkGrowth,
        };
      },
      300, // 5 minutes cache
    );
  }

  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const cacheKey = `analytics:user:${userId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // This would query user-specific transaction data
        // For now, return mock data structure
        return {
          userId,
          totalTransactions: 0,
          totalVolume: '0',
          averageTransactionValue: '0',
          mostActiveDay: new Date().toISOString(),
          topTokens: [],
        };
      },
      60, // 1 minute cache
    );
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    const cacheKey = 'analytics:realtime';

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const txCount24h = await this.transactionRepository
          .createQueryBuilder('tx')
          .where('tx.createdAt >= :last24h', { last24h })
          .getCount();

        const blockCount24h = await this.blockRepository
          .createQueryBuilder('block')
          .where('block.createdAt >= :last24h', { last24h })
          .getCount();

        return {
          transactions24h: txCount24h,
          blocks24h: blockCount24h,
          tps: txCount24h / (24 * 60 * 60), // Transactions per second
          bps: blockCount24h / (24 * 60 * 60), // Blocks per second
          timestamp: new Date().toISOString(),
        };
      },
      10, // 10 seconds cache
    );
  }
}
