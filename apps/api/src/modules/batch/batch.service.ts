import { Injectable } from '@nestjs/common';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

/**
 * Batch Service
 *
 * Provides batch operations for efficient multi-address queries.
 * Optimized for performance with parallel processing and caching.
 */
@Injectable()
export class BatchService {
  constructor(
    private rpcService: RpcService,
    private cacheService: CacheService,
  ) {}

  /**
   * Gets balances for multiple addresses in a single request.
   *
   * @param {string[]} addresses - Array of addresses (max 100)
   * @returns {Promise<ResponseDto>} Array of balances
   */
  async getBalancesBatch(addresses: string[]) {
    if (addresses.length > 100) {
      return ResponseDto.error('Maximum 100 addresses allowed per batch');
    }

    // Process in parallel with caching
    const balancePromises = addresses.map(async (address) => {
      const cacheKey = `balance:${address}`;
      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const balance = await this.rpcService.getBalance(address);
          return {
            address,
            balance: balance.toString(),
          };
        },
        10, // 10 seconds cache
      );
    });

    const balances = await Promise.all(balancePromises);

    return ResponseDto.success(balances);
  }

  /**
   * Gets transaction counts for multiple addresses.
   *
   * @param {string[]} addresses - Array of addresses (max 50)
   * @returns {Promise<ResponseDto>} Array of transaction counts
   */
  async getTransactionCountsBatch(addresses: string[]) {
    if (addresses.length > 50) {
      return ResponseDto.error('Maximum 50 addresses allowed per batch');
    }

    const countPromises = addresses.map(async (address) => {
      try {
        // This would typically query the database
        // For now, return placeholder
        return {
          address,
          transactionCount: 0,
        };
      } catch (error) {
        return {
          address,
          transactionCount: 0,
          error: 'Failed to fetch',
        };
      }
    });

    const counts = await Promise.all(countPromises);

    return ResponseDto.success(counts);
  }

  /**
   * Gets token balances for multiple addresses and tokens.
   *
   * @param {Array<{address: string, tokenAddress: string}>} requests - Array of address-token pairs
   * @returns {Promise<ResponseDto>} Array of token balances
   */
  async getTokenBalancesBatch(
    requests: Array<{ address: string; tokenAddress: string }>,
  ) {
    if (requests.length > 50) {
      return ResponseDto.error('Maximum 50 requests allowed per batch');
    }

    const balancePromises = requests.map(async ({ address, tokenAddress }) => {
      const cacheKey = `token:balance:${tokenAddress}:${address}`;

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          try {
            // This would use the token service to get balance
            // Simplified for now
            return {
              address,
              tokenAddress,
              balance: '0',
            };
          } catch (error) {
            return {
              address,
              tokenAddress,
              balance: '0',
              error: 'Failed to fetch',
            };
          }
        },
        60, // 1 minute cache
      );
    });

    const balances = await Promise.all(balancePromises);

    return ResponseDto.success(balances);
  }

  /**
   * Gets block information for multiple block numbers.
   *
   * @param {number[]} blockNumbers - Array of block numbers (max 20)
   * @returns {Promise<ResponseDto>} Array of block information
   */
  async getBlocksBatch(blockNumbers: number[]) {
    if (blockNumbers.length > 20) {
      return ResponseDto.error('Maximum 20 blocks allowed per batch');
    }

    const blockPromises = blockNumbers.map(async (blockNumber) => {
      const cacheKey = `block:${blockNumber}`;

      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const block = await this.rpcService.getBlock(blockNumber);
          if (!block) {
            return {
              blockNumber,
              error: 'Block not found',
            };
          }

          return {
            blockNumber: block.number,
            hash: block.hash,
            timestamp: block.timestamp,
            gasUsed: block.gasUsed?.toString() || '0',
            gasLimit: block.gasLimit?.toString() || '0',
            transactionCount: Array.isArray(block.transactions)
              ? block.transactions.length
              : 0,
          };
        },
        60, // 1 minute cache
      );
    });

    const blocks = await Promise.all(blockPromises);

    return ResponseDto.success(blocks);
  }
}
