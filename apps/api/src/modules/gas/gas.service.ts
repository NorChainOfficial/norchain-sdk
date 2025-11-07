import { Injectable } from '@nestjs/common';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

/**
 * Gas Service
 * 
 * Provides gas price estimation and oracle data.
 */
@Injectable()
export class GasService {
  constructor(
    private rpcService: RpcService,
    private cacheService: CacheService,
  ) {}

  /**
   * Gets gas oracle data with recommended gas prices.
   * 
   * @returns {Promise<ResponseDto>} Gas oracle data
   */
  async getGasOracle() {
    const cacheKey = 'gas:oracle';

    const oracle = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const feeData = await this.rpcService.getFeeData();
        const currentBlock = await this.rpcService.getBlockNumber();
        const block = await this.rpcService.getBlock('latest');

        // Calculate gas prices (adjust multipliers based on your chain)
        const baseFee = feeData.gasPrice || BigInt(0);
        const slow = baseFee; // 1x
        const standard = (baseFee * BigInt(110)) / BigInt(100); // 1.1x
        const fast = (baseFee * BigInt(120)) / BigInt(100); // 1.2x
        const fastest = (baseFee * BigInt(150)) / BigInt(100); // 1.5x

        return {
          LastBlock: currentBlock.toString(),
          SafeGasPrice: slow.toString(),
          ProposeGasPrice: standard.toString(),
          FastGasPrice: fast.toString(),
          suggestBaseFee: baseFee.toString(),
          gasUsedRatio: block
            ? Number(block.gasUsed) / Number(block.gasLimit)
            : 0,
        };
      },
      30, // 30 seconds cache
    );

    return ResponseDto.success(oracle);
  }

  /**
   * Estimates gas for a transaction.
   * 
   * @param {any} transaction - Transaction request
   * @returns {Promise<ResponseDto>} Gas estimate
   */
  async estimateGas(transaction: {
    to?: string;
    from?: string;
    value?: string;
    data?: string;
    gas?: string;
  }) {
    try {
      const txRequest: any = {};

      if (transaction.to) txRequest.to = transaction.to;
      if (transaction.from) txRequest.from = transaction.from;
      if (transaction.value) txRequest.value = transaction.value;
      if (transaction.data) txRequest.data = transaction.data;

      const gasEstimate = await this.rpcService.estimateGas(txRequest);

      return ResponseDto.success({
        gasEstimate: gasEstimate.toString(),
        gasUsed: gasEstimate.toString(),
      });
    } catch (error: any) {
      return ResponseDto.error(error.message || 'Gas estimation failed');
    }
  }
}

