import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BridgeController } from './bridge.controller';
import { BridgeService } from './bridge.service';
import { BridgeTransfer } from './entities/bridge-transfer.entity';
import { CommonModule } from '@/common/common.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [TypeOrmModule.forFeature([BridgeTransfer]), CommonModule, PolicyModule],
  controllers: [BridgeController],
  providers: [BridgeService],
  exports: [BridgeService],
})
export class BridgeModule {}
