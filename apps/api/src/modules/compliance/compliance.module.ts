import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { ComplianceScreening } from './entities/compliance-screening.entity';
import { ComplianceCase } from './entities/compliance-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceScreening, ComplianceCase])],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
