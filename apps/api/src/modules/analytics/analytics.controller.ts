import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Public } from '@/common/decorators/public.decorator';
import { IsEthereumAddress, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Get('portfolio')
  @ApiOperation({ summary: 'Get portfolio summary for an address' })
  @ApiResponse({ status: 200, description: 'Portfolio summary retrieved successfully' })
  async getPortfolioSummary(@Query('address') address: string) {
    return this.analyticsService.getPortfolioSummary(address);
  }

  @Public()
  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction analytics for an address' })
  @ApiResponse({ status: 200, description: 'Transaction analytics retrieved successfully' })
  async getTransactionAnalytics(
    @Query('address') address: string,
    @Query('days') @Type(() => Number) @IsOptional() @IsInt() @Min(1) @Max(365) days?: number,
  ) {
    return this.analyticsService.getTransactionAnalytics(address, days || 30);
  }

  @Public()
  @Get('network')
  @ApiOperation({ summary: 'Get network statistics and trends' })
  @ApiResponse({ status: 200, description: 'Network statistics retrieved successfully' })
  async getNetworkStatistics() {
    return this.analyticsService.getNetworkStatistics();
  }
}

