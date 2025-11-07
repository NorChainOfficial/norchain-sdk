import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  controllers: [BatchController],
  providers: [BatchService, RpcService, CacheService],
  exports: [BatchService],
})
export class BatchModule {}

