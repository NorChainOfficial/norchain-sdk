import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageController } from './usage.controller';
import { UsageService } from './usage.service';
import { ApiUsage } from './entities/api-usage.entity';
import { UsageBilling } from './entities/usage-billing.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiUsage, UsageBilling]),
    EventEmitterModule,
  ],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}

