import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @Get('ethsupply')
  @ApiOperation({ summary: 'Get total ETH supply' })
  @ApiResponse({
    status: 200,
    description: 'ETH supply retrieved successfully',
  })
  async getEthSupply() {
    return this.statsService.getEthSupply();
  }

  @Public()
  @Get('ethprice')
  @ApiOperation({ summary: 'Get ETH price' })
  @ApiResponse({ status: 200, description: 'ETH price retrieved successfully' })
  async getEthPrice() {
    return this.statsService.getEthPrice();
  }

  @Public()
  @Get('chainsize')
  @ApiOperation({ summary: 'Get chain size statistics' })
  @ApiResponse({
    status: 200,
    description: 'Chain size retrieved successfully',
  })
  async getChainSize() {
    return this.statsService.getChainSize();
  }

  @Public()
  @Get('nodecount')
  @ApiOperation({ summary: 'Get network node count' })
  @ApiResponse({
    status: 200,
    description: 'Node count retrieved successfully',
  })
  async getNodeCount() {
    return this.statsService.getNodeCount();
  }
}
