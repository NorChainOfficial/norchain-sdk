import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { Block } from '@/modules/block/entities/block.entity';
import { TokenTransfer } from '@/modules/token/entities/token-transfer.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Block, TokenTransfer]),
    CommonModule,
  ],
  controllers: [AnalyticsController, AdvancedAnalyticsController],
  providers: [AnalyticsService, AdvancedAnalyticsService, RpcService],
  exports: [AnalyticsService, AdvancedAnalyticsService],
})
export class AnalyticsModule {}
