import { Injectable, Logger } from '@nestjs/common';
import { StateRootService } from './services/state-root.service';
import { ValidatorService } from './services/validator.service';
import { ConsensusService } from './services/consensus.service';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    private readonly stateRootService: StateRootService,
    private readonly validatorService: ValidatorService,
    private readonly consensusService: ConsensusService,
  ) {}

  async getStateRoot(blockNumber: string) {
    return this.stateRootService.getStateRoot(blockNumber);
  }

  async getValidators() {
    return this.validatorService.getValidators();
  }

  async getConsensusInfo() {
    return this.consensusService.getInfo();
  }
}

