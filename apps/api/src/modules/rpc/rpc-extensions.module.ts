import { Module } from '@nestjs/common';
import { RPCExtensionsController } from './rpc-extensions.controller';
import { RPCExtensionsService } from './rpc-extensions.service';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [RPCExtensionsController],
  providers: [RPCExtensionsService],
  exports: [RPCExtensionsService],
})
export class RPCExtensionsModule {}
