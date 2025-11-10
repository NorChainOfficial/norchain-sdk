import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PerformanceMonitorService } from './performance-monitor.service';
import { PerformanceMonitorInterceptor } from './performance-monitor.interceptor';
import { PrometheusService } from './services/prometheus.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [EventEmitterModule, CommonModule],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    PerformanceMonitorService,
    PerformanceMonitorInterceptor,
    PrometheusService,
    RpcService,
  ],
  exports: [
    MonitoringService,
    PerformanceMonitorService,
    PerformanceMonitorInterceptor,
    PrometheusService,
  ],
})
export class MonitoringModule {}
