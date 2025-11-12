import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsService } from '../stats/stats.service';
import { BlockService } from '../block/block.service';
import { GasService } from '../gas/gas.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Explorer - Stats')
@Controller('stats')
@Public()
export class ExplorerStatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly blockService: BlockService,
    private readonly gasService: GasService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get network statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats() {
    try {
      const [blockNumberResult, chainSize, nodeCount, transactionCount, accountCountResult, gasOracleResult] = await Promise.all([
        this.blockService.getBlockNumber().catch(() => ({ result: 0 })),
        this.statsService.getChainSize().catch(() => ({ result: {} })),
        this.statsService.getNodeCount().catch(() => ({ result: {} })),
        this.transactionRepository.count().catch(() => 0),
        // Get unique account count from transactions (from/to addresses)
        this.transactionRepository
          .createQueryBuilder('tx')
          .select('COUNT(DISTINCT tx.fromAddress)', 'count')
          .getRawOne()
          .then((result) => parseInt(result?.count || '0', 10))
          .catch(() => 0),
        // Get gas price from gas service
        this.gasService.getGasOracle().catch(() => ({ result: { SafeGasPrice: '1000000000' } })),
      ]);

      const blockNumber = blockNumberResult.result || 0;
      let latestBlock = null;
      
      if (blockNumber > 0) {
        try {
          const blockResult = await this.blockService.getBlock({ blockno: blockNumber });
          latestBlock = (blockResult.result as any) || blockResult;
        } catch (error) {
          // Fallback if block fetch fails
        }
      }

      // Extract gas price from gas oracle
      const gasOracle = gasOracleResult?.result || {};
      const gasPrice = gasOracle.SafeGasPrice || gasOracle.ProposeGasPrice || '1000000000';

      // Return format expected by Explorer
      return {
        blockHeight: blockNumber,
        totalTransactions: transactionCount,
        totalAccounts: accountCountResult || 0,
        gasPrice: gasPrice.toString(),
        activeValidators: (nodeCount.result as any)?.nodeCount || (nodeCount.result as any)?.TotalNodeCount || 0,
        latest_block: {
          height: blockNumber,
          hash: latestBlock?.hash || '',
          timestamp: latestBlock?.timestamp || (chainSize.result as any)?.blockTime || Date.now().toString(),
          transaction_count: latestBlock?.transactionCount || 0,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch network statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

