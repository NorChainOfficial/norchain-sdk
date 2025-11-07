import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { RpcService } from '@/common/services/rpc.service';

@Module({
  controllers: [ProxyController],
  providers: [ProxyService, RpcService],
  exports: [ProxyService],
})
export class ProxyModule {}

