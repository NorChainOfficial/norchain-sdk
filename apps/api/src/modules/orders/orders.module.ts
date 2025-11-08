import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { LimitOrder } from './entities/limit-order.entity';
import { StopLossOrder } from './entities/stop-loss-order.entity';
import { DCASchedule } from './entities/dca-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LimitOrder, StopLossOrder, DCASchedule])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
