import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Validator } from './entities/validator.entity';
import { SlashingEvent } from './entities/slashing-event.entity';
import { FeatureFlag } from './entities/feature-flag.entity';
import { AuditLog } from './entities/audit-log.entity';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Validator, SlashingEvent, FeatureFlag, AuditLog]),
    CommonModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

