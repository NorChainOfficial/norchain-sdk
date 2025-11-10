import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
import { PolicyCheck } from './entities/policy-check.entity';
import { CommonModule } from '@/common/common.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([PolicyCheck]),
    CommonModule,
    EventEmitterModule,
  ],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
