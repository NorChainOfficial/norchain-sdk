import { Module } from '@nestjs/common';
import { SwapController } from './swap.controller';
import { SwapService } from './swap.service';
import { PriceAggregatorService } from './price-aggregator.service';

@Module({
  controllers: [SwapController],
  providers: [SwapService, PriceAggregatorService],
  exports: [SwapService],
})
export class SwapModule {}
