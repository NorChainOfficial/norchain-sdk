import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { GetBlockDto } from './dto/get-block.dto';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

/**
 * Block Service
 * 
 * Provides block-related operations including block queries,
 * block rewards, and block countdown.
 */
@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    private rpcService: RpcService,
    private cacheService: CacheService,
  ) {
    // Initialize RPC service
  }

  /**
   * Gets block information by block number or tag.
   * 
   * @param {GetBlockDto} dto - DTO containing block number or tag
   * @returns {Promise<ResponseDto>} Block information
   */
  async getBlock(dto: GetBlockDto) {
    const blockNumber = dto.blockno || dto.tag || 'latest';
    const cacheKey = `block:${blockNumber}`;

    const block = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Try database first (only if blockno is provided as number)
        if (dto.blockno && typeof dto.blockno === 'number') {
          const dbBlock = await this.blockRepository.findOne({
            where: { number: dto.blockno },
            relations: ['transactions'],
          });

          if (dbBlock) {
            return this.formatBlock(dbBlock);
          }
        }

        // Fallback to RPC
        const blockParam =
          blockNumber === 'latest' || blockNumber === 'pending'
            ? blockNumber
            : typeof blockNumber === 'number'
              ? blockNumber
              : Number(blockNumber);

        const rpcBlock = await this.rpcService.getBlock(blockParam);

        if (!rpcBlock) {
          return null;
        }

        return this.formatRpcBlock(rpcBlock);
      },
      10, // 10 seconds cache
    );

    if (!block) {
      return ResponseDto.error('Block not found');
    }

    return ResponseDto.success(block);
  }

  /**
   * Gets block reward information.
   * 
   * Calculates block reward including base reward, uncle rewards, and fees.
   * 
   * @param {number} blockNumber - Block number
   * @returns {Promise<ResponseDto>} Block reward information
   */
  async getBlockReward(blockNumber: number) {
    const cacheKey = `block:reward:${blockNumber}`;

    const reward = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const block = await this.rpcService.getBlock(blockNumber);
        if (!block) {
          return null;
        }

        // Calculate block reward (simplified - would need actual chain parameters)
        const baseReward = BigInt(2) * BigInt(10) ** BigInt(18); // 2 ETH base reward
        const gasUsed = block.gasUsed || BigInt(0);
        let fees = BigInt(0);
        try {
          const feeData = await this.rpcService.getFeeData();
          const gasPrice = feeData.gasPrice || BigInt(0);
          fees = gasUsed * gasPrice;
        } catch (error) {
          // If fee data unavailable, use zero fees
          fees = BigInt(0);
        }

        return {
          blockNumber,
          timeStamp: block.timestamp,
          blockMiner: block.miner,
          blockReward: baseReward.toString(),
          uncles: [],
          uncleInclusionReward: '0',
          totalReward: (baseReward + fees).toString(),
        };
      },
      60, // 1 minute cache
    );

    if (!reward) {
      return ResponseDto.error('Block not found');
    }

    return ResponseDto.success(reward);
  }

  /**
   * Gets block countdown until next block.
   * 
   * @param {number} blockNumber - Block number
   * @returns {Promise<ResponseDto>} Countdown information
   */
  async getBlockCountdown(blockNumber: number) {
    const currentBlock = await this.rpcService.getBlockNumber();
    const targetBlock = blockNumber;

    if (targetBlock <= currentBlock) {
      return ResponseDto.success({
        CurrentBlock: currentBlock,
        CountdownBlock: targetBlock,
        RemainingBlock: 0,
        EstimateTimeInSec: 0,
      });
    }

    const remainingBlocks = targetBlock - currentBlock;
    const avgBlockTime = 12; // Average block time in seconds (adjust for your chain)
    const estimateTime = remainingBlocks * avgBlockTime;

    return ResponseDto.success({
      CurrentBlock: currentBlock,
      CountdownBlock: targetBlock,
      RemainingBlock: remainingBlocks,
      EstimateTimeInSec: estimateTime,
    });
  }

  /**
   * Gets latest block number.
   * 
   * @returns {Promise<ResponseDto>} Latest block number
   */
  async getBlockNumber() {
    const blockNumber = await this.rpcService.getBlockNumber();
    return ResponseDto.success(blockNumber);
  }

  /**
   * Formats database block to API format.
   */
  private formatBlock(block: Block) {
    return {
      blockNumber: block.number.toString(),
      timeStamp: block.timestamp.toString(),
      blockReward: '0',
      blockMiner: block.miner,
      blockHash: block.hash,
      parentHash: block.parentHash,
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      transactions: block.transactions?.map((tx) => tx.hash) || [],
      transactionCount: block.transactionsCount,
    };
  }

  /**
   * Formats RPC block to API format.
   */
  private formatRpcBlock(block: any) {
    return {
      blockNumber: block.number.toString(),
      timeStamp: block.timestamp.toString(),
      blockReward: '0',
      blockMiner: block.miner,
      blockHash: block.hash,
      parentHash: block.parentHash,
      gasLimit: block.gasLimit.toString(),
      gasUsed: block.gasUsed.toString(),
      transactions: Array.isArray(block.transactions)
        ? block.transactions.map((tx: any) =>
            typeof tx === 'string' ? tx : tx.hash,
          )
        : [],
      transactionCount: Array.isArray(block.transactions)
        ? block.transactions.length
        : 0,
    };
  }
}

