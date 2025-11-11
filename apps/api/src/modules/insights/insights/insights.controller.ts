import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Insights')
@Controller('insights')
@Public()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('holders/top')
  @ApiOperation({ summary: 'Get top token holders' })
  @ApiQuery({ name: 'token', description: 'Token address', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Top holders retrieved successfully',
  })
  async getTopHolders(
    @Query('token') tokenAddress: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.insightsService.getTopHolders(tokenAddress, limit);
  }

  @Get('dex/tvl')
  @ApiOperation({ summary: 'Get DEX TVL over time range' })
  @ApiQuery({
    name: 'window',
    required: false,
    enum: ['1d', '7d', '30d', '1y'],
  })
  @ApiResponse({
    status: 200,
    description: 'DEX TVL retrieved successfully',
  })
  async getDEXTVL(@Query('window') window?: '1d' | '7d' | '30d' | '1y') {
    return this.insightsService.getDEXTVL(window);
  }

  @Get('gas/heatmap')
  @ApiOperation({ summary: 'Get gas usage heatmap' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Gas heatmap retrieved successfully',
  })
  async getGasHeatmap(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    return this.insightsService.getGasHeatmap(days);
  }
}
