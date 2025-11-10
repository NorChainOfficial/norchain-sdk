import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Advanced Analytics')
@Controller('analytics')
export class AdvancedAnalyticsController {
  constructor(private readonly analyticsService: AdvancedAnalyticsService) {}

  @Get('network')
  @Public()
  @ApiOperation({ summary: 'Get comprehensive network analytics' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'ISO date string',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'ISO date string',
  })
  @ApiResponse({
    status: 200,
    description: 'Network analytics retrieved successfully',
  })
  async getNetworkAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getNetworkAnalytics(start, end);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user-specific analytics' })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
  })
  async getUserAnalytics(@Request() req: any) {
    return this.analyticsService.getUserAnalytics(req.user.id);
  }

  @Get('realtime')
  @Public()
  @ApiOperation({ summary: 'Get real-time network metrics' })
  @ApiResponse({
    status: 200,
    description: 'Real-time metrics retrieved successfully',
  })
  async getRealTimeMetrics() {
    return this.analyticsService.getRealTimeMetrics();
  }
}
