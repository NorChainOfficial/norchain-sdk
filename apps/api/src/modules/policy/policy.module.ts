import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
import { PolicyCheck } from './entities/policy-check.entity';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyCheck]), CommonModule],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}

