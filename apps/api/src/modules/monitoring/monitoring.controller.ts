import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PerformanceMonitorService } from './performance-monitor.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly performanceMonitor: PerformanceMonitorService) {}

  @Get('performance')
  @Public()
  @ApiOperation({ summary: 'Get performance statistics for all endpoints' })
  @ApiQuery({
    name: 'timeWindow',
    required: false,
    type: Number,
    description: 'Time window in milliseconds (default: 1 hour)',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance statistics retrieved successfully',
  })
  async getPerformanceStats(
    @Query('timeWindow', ParseIntPipe) timeWindow?: number,
  ) {
    return this.performanceMonitor.getAllStats(timeWindow);
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Get system health metrics' })
  @ApiResponse({
    status: 200,
    description: 'Health metrics retrieved successfully',
  })
  async getHealthMetrics() {
    return this.performanceMonitor.getHealthMetrics();
  }
}
