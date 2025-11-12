import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { ComplianceScreening } from './entities/compliance-screening.entity';
import { ComplianceCase } from './entities/compliance-case.entity';
import { TravelRulePartner } from './entities/travel-rule-partner.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplianceScreening,
      ComplianceCase,
      TravelRulePartner,
    ]),
    EventEmitterModule,
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
