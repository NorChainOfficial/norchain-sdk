import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LimitOrder } from './entities/limit-order.entity';
import { StopLossOrder } from './entities/stop-loss-order.entity';
import { DCASchedule } from './entities/dca-schedule.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(LimitOrder)
    private limitOrderRepository: Repository<LimitOrder>,
    @InjectRepository(StopLossOrder)
    private stopLossOrderRepository: Repository<StopLossOrder>,
    @InjectRepository(DCASchedule)
    private dcaScheduleRepository: Repository<DCASchedule>,
  ) {}

  // Limit Orders
  async createLimitOrder(data: any) {
    const order = this.limitOrderRepository.create(data);
    return this.limitOrderRepository.save(order);
  }

  async getLimitOrders(userAddress: string) {
    return this.limitOrderRepository.find({
      where: { userAddress },
      order: { createdAt: 'DESC' },
    });
  }

  async cancelLimitOrder(id: string) {
    await this.limitOrderRepository.update(id, { status: 'cancelled' });
    return { success: true };
  }

  // Stop-Loss Orders
  async createStopLossOrder(data: any) {
    const order = this.stopLossOrderRepository.create(data);
    return this.stopLossOrderRepository.save(order);
  }

  async getStopLossOrders(userAddress: string) {
    return this.stopLossOrderRepository.find({
      where: { userAddress },
      order: { createdAt: 'DESC' },
    });
  }

  // DCA Schedules
  async createDCASchedule(data: any) {
    const schedule = this.dcaScheduleRepository.create(data);
    return this.dcaScheduleRepository.save(schedule);
  }

  async getDCASchedules(userAddress: string) {
    return this.dcaScheduleRepository.find({
      where: { userAddress },
      order: { createdAt: 'DESC' },
    });
  }
}
