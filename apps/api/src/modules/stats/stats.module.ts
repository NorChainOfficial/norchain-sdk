import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ApiUsage } from './entities/api-usage.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApiUsage])],
  controllers: [StatsController],
  providers: [StatsService, RpcService, CacheService],
  exports: [StatsService],
})
export class StatsModule {}
