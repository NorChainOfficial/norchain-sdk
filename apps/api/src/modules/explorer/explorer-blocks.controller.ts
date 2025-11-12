import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BlockService } from '../block/block.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Explorer - Blocks')
@Controller('blocks')
@Public()
export class ExplorerBlocksController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of blocks' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'per_page', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (alias for per_page)' })
  @ApiResponse({ status: 200, description: 'Blocks retrieved successfully' })
  async getBlocks(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('limit') limit?: number,
  ) {
    // Returns latest block info
    // Note: Full pagination will be implemented when block repository has indexed data
    const blockNumberResult = await this.blockService.getBlockNumber();
    const latestBlockNumber = blockNumberResult.result || 0;
    const blockData = await this.blockService.getBlock({ blockno: latestBlockNumber });
    
    // Return format expected by Explorer
    return {
      data: blockData.result ? [blockData.result] : [],
      meta: {
        current_page: page || 1,
        per_page: perPage || limit || 20,
        total: 1,
        last_page: 1,
      },
      pagination: {
        current_page: page || 1,
        per_page: perPage || limit || 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest block' })
  @ApiResponse({ status: 200, description: 'Latest block retrieved successfully' })
  async getLatestBlock() {
    const blockNumberResult = await this.blockService.getBlockNumber();
    const blockNumber = blockNumberResult.result || 0;
    const result = await this.blockService.getBlock({ blockno: blockNumber });
    return result.result || result;
  }

  @Get(':height(\\d+)')
  @ApiOperation({ summary: 'Get block by height' })
  @ApiParam({ name: 'height', type: Number, description: 'Block height' })
  @ApiResponse({ status: 200, description: 'Block retrieved successfully' })
  async getBlock(@Param('height', ParseIntPipe) height: number) {
    const result = await this.blockService.getBlock({ blockno: height });
    return result.result || result;
  }
}

