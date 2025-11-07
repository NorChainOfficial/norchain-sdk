import { Module } from '@nestjs/common';
import { GasController } from './gas.controller';
import { GasService } from './gas.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  controllers: [GasController],
  providers: [GasService, RpcService, CacheService],
  exports: [GasService],
})
export class GasModule {}

