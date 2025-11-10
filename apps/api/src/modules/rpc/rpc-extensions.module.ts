import { Module, forwardRef } from '@nestjs/common';
import { RPCExtensionsController } from './rpc-extensions.controller';
import { RPCExtensionsService } from './rpc-extensions.service';
import { CommonModule } from '@/common/common.module';
import { MetadataModule } from '../metadata/metadata.module';

@Module({
  imports: [CommonModule, forwardRef(() => MetadataModule)],
  controllers: [RPCExtensionsController],
  providers: [RPCExtensionsService],
  exports: [RPCExtensionsService],
})
export class RPCExtensionsModule {}
