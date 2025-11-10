import { Module } from '@nestjs/common';
import { FinalityController } from './finality/finality.controller';
import { ValidatorsController } from './validators/validators.controller';
import { InsightsController } from './insights/insights.controller';
import { InsightsService } from './insights/insights.service';
import { RPCExtensionsModule } from '../rpc/rpc-extensions.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [RPCExtensionsModule, CommonModule],
  controllers: [FinalityController, ValidatorsController, InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class V2Module {}

