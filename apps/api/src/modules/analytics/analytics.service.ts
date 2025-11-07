import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TokenTransfer } from '@/modules/token/entities/token-transfer.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

/**
 * Analytics Service
 * 
 * Provides advanced analytics and insights for addresses and network.
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(TokenTransfer)
    private tokenTransferRepository: Repository<TokenTransfer>,
    private rpcService: RpcService,
    private cacheService: CacheService,
  ) {}

  /**
   * Gets portfolio summary for an address.
   * 
   * @param {string} address - Address to analyze
   * @returns {Promise<ResponseDto>} Portfolio summary
   */
  async getPortfolioSummary(address: string) {
    const cacheKey = `analytics:portfolio:${address}`;

    const summary = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Get native balance
        const nativeBalance = await this.rpcService.getBalance(address);

        // Get transaction stats
        const [sentCount, receivedCount] = await Promise.all([
          this.transactionRepository.count({
            where: { fromAddress: address },
          }),
          this.transactionRepository.count({
            where: { toAddress: address },
          }),
        ]);

        // Get token transfer stats
        const tokenTransferCount = await this.tokenTransferRepository.count({
          where: [
            { fromAddress: address },
            { toAddress: address },
          ],
        });

        // Calculate total value (simplified - would need token prices)
        const totalValue = {
          native: nativeBalance.toString(),
          tokens: '0', // Would calculate from token balances
          totalUSD: '0', // Would calculate from prices
        };

        return {
          address,
          nativeBalance: nativeBalance.toString(),
          transactionStats: {
            sent: sentCount,
            received: receivedCount,
            total: sentCount + receivedCount,
          },
          tokenTransferCount,
          totalValue,
          firstTransaction: null, // Would query first transaction
          lastTransaction: null, // Would query last transaction
        };
      },
      300, // 5 minutes cache
    );

    return ResponseDto.success(summary);
  }

  /**
   * Gets transaction analytics for an address.
   * 
   * @param {string} address - Address to analyze
   * @param {number} days - Number of days to analyze (default: 30)
   * @returns {Promise<ResponseDto>} Transaction analytics
   */
  async getTransactionAnalytics(address: string, days: number = 30) {
    const cacheKey = `analytics:tx:${address}:${days}`;

    const analytics = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get transactions in date range
        const transactions = await this.transactionRepository
          .createQueryBuilder('tx')
          .where('(tx.fromAddress = :address OR tx.toAddress = :address)', {
            address,
          })
          .andWhere('tx.createdAt >= :startDate', { startDate })
          .getMany();

        // Calculate statistics
        const totalSent = transactions
          .filter((tx) => tx.fromAddress === address)
          .reduce((sum, tx) => sum + BigInt(tx.value), BigInt(0));

        const totalReceived = transactions
          .filter((tx) => tx.toAddress === address)
          .reduce((sum, tx) => sum + BigInt(tx.value), BigInt(0));

        const totalGasUsed = transactions.reduce(
          (sum, tx) => sum + BigInt(tx.gasUsed || 0),
          BigInt(0),
        );

        return {
          address,
          period: `${days} days`,
          totalTransactions: transactions.length,
          totalSent: totalSent.toString(),
          totalReceived: totalReceived.toString(),
          netFlow: (totalReceived - totalSent).toString(),
          totalGasUsed: totalGasUsed.toString(),
          averageGasPerTx:
            transactions.length > 0
              ? (totalGasUsed / BigInt(transactions.length)).toString()
              : '0',
          successRate:
            transactions.length > 0
              ? (
                  (transactions.filter((tx) => tx.status === 1).length /
                    transactions.length) *
                  100
                ).toFixed(2)
              : '0',
        };
      },
      300,
    );

    return ResponseDto.success(analytics);
  }

  /**
   * Gets network statistics and trends.
   * 
   * @returns {Promise<ResponseDto>} Network statistics
   */
  async getNetworkStatistics() {
    const cacheKey = 'analytics:network';

    const stats = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const currentBlock = await this.rpcService.getBlockNumber();
        const latestBlock = await this.rpcService.getBlock('latest');

        // Get recent transaction count (last 100 blocks)
        const recentTxCount = await this.transactionRepository
          .createQueryBuilder('tx')
          .where('tx.blockNumber >= :startBlock', {
            startBlock: currentBlock - 100,
          })
          .getCount();

        return {
          currentBlock,
          totalTransactions: await this.transactionRepository.count(),
          recentTransactionCount: recentTxCount,
          averageBlockTime: 12, // Would calculate from actual block times
          networkHashRate: '0', // Would get from network
          activeAddresses: 0, // Would calculate from recent transactions
          totalValueTransferred: '0', // Would sum from transactions
          blockTime: latestBlock?.timestamp || 0,
        };
      },
      60, // 1 minute cache
    );

    return ResponseDto.success(stats);
  }
}

