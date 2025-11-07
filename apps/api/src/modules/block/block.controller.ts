import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BlockService } from './block.service';
import { GetBlockDto } from './dto/get-block.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Block')
@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Public()
  @Get('getblock')
  @ApiOperation({ summary: 'Get block information by block number or tag' })
  @ApiResponse({ status: 200, description: 'Block retrieved successfully' })
  async getBlock(@Query() dto: GetBlockDto) {
    return this.blockService.getBlock(dto);
  }

  @Public()
  @Get('getblockreward')
  @ApiOperation({ summary: 'Get block reward information' })
  @ApiResponse({ status: 200, description: 'Block reward retrieved successfully' })
  async getBlockReward(@Query('blockno') blockno: number) {
    return this.blockService.getBlockReward(blockno);
  }

  @Public()
  @Get('getblockcountdown')
  @ApiOperation({ summary: 'Get block countdown until next block' })
  @ApiResponse({ status: 200, description: 'Countdown retrieved successfully' })
  async getBlockCountdown(@Query('blockno') blockno: number) {
    return this.blockService.getBlockCountdown(blockno);
  }

  @Public()
  @Get('getblocknumber')
  @ApiOperation({ summary: 'Get latest block number' })
  @ApiResponse({ status: 200, description: 'Block number retrieved successfully' })
  async getBlockNumber() {
    return this.blockService.getBlockNumber();
  }
}

