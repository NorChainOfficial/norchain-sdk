import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PrometheusService } from './services/prometheus.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, PrometheusService, RpcService, CacheService],
  exports: [MonitoringService, PrometheusService],
})
export class MonitoringModule {}
