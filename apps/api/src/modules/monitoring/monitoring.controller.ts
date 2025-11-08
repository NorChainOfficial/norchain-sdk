import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { PrometheusService } from './services/prometheus.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly prometheusService: PrometheusService,
  ) {}

  @Public()
  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics() {
    return this.prometheusService.getMetrics();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealth() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Node statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.monitoringService.getStats();
  }
}

