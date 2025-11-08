import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { StateRootService } from './services/state-root.service';
import { ValidatorService } from './services/validator.service';
import { ConsensusService } from './services/consensus.service';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [BlockchainController],
  providers: [
    BlockchainService,
    StateRootService,
    ValidatorService,
    ConsensusService,
  ],
  exports: [BlockchainService],
})
export class BlockchainModule {}

