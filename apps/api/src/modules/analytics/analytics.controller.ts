import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Get('portfolio')
  @ApiOperation({ summary: 'Get portfolio summary for an address' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio summary retrieved successfully',
  })
  async getPortfolioSummary(@Query('address') address: string) {
    return this.analyticsService.getPortfolioSummary(address);
  }

  @Public()
  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction analytics for an address' })
  @ApiResponse({
    status: 200,
    description: 'Transaction analytics retrieved successfully',
  })
  async getTransactionAnalytics(
    @Query('address') address: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number = 30,
  ) {
    // Validate days range
    if (days < 1 || days > 365) {
      days = 30;
    }
    return this.analyticsService.getTransactionAnalytics(address, days);
  }

  @Public()
  @Get('network')
  @ApiOperation({ summary: 'Get network statistics and trends' })
  @ApiResponse({
    status: 200,
    description: 'Network statistics retrieved successfully',
  })
  async getNetworkStatistics() {
    return this.analyticsService.getNetworkStatistics();
  }
}
