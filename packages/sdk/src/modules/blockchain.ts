import { AxiosInstance } from 'axios';

export interface StateRootResponse {
  readonly blockNumber: string;
  readonly stateRoot: string;
  readonly timestamp: string;
}

export interface ValidatorInfo {
  readonly address: string;
  readonly votingPower: string;
  readonly proposerPriority: string;
  readonly isActive: boolean;
}

export interface ValidatorsResponse {
  readonly validators: readonly ValidatorInfo[];
  readonly totalVotingPower: string;
  readonly blockHeight: string;
}

export interface ConsensusInfo {
  readonly consensusType: string;
  readonly blockHeight: string;
  readonly round: number;
  readonly step: string;
  readonly validatorSetHash: string;
}

/**
 * Blockchain module for core blockchain operations
 */
export class BlockchainModule {
  constructor(private readonly axios: AxiosInstance) {}

  /**
   * Get state root for a specific block
   */
  async getStateRoot(blockNumber: string): Promise<StateRootResponse> {
    const response = await this.axios.get<StateRootResponse>(
      `/blockchain/state-root/${blockNumber}`
    );
    return response.data;
  }

  /**
   * Get current validator set information
   */
  async getValidators(): Promise<ValidatorsResponse> {
    const response = await this.axios.get<ValidatorsResponse>('/blockchain/validators');
    return response.data;
  }

  /**
   * Get consensus mechanism information
   */
  async getConsensusInfo(): Promise<ConsensusInfo> {
    const response = await this.axios.get<ConsensusInfo>('/blockchain/consensus/info');
    return response.data;
  }
}
