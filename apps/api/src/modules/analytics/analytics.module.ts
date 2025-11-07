import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TokenTransfer } from '@/modules/token/entities/token-transfer.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TokenTransfer])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RpcService, CacheService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

