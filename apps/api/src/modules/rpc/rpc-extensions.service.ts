import { Injectable } from '@nestjs/common';
import { RpcService } from '@/common/services/rpc.service';
import { ethers } from 'ethers';
import { randomBytes } from 'crypto';

export interface FinalityStatus {
  status: 'unsafe' | 'safe' | 'final';
  blockNumber: number;
  confidence: number; // 0-100
  timestamp: Date;
}

export interface StateProof {
  keys: string[];
  values: string[];
  proof: string;
  blockNumber: number;
}

export interface ValidatorSetInfo {
  validators: Array<{
    address: string;
    stake: string;
    uptime: number;
    complianceScore: number;
    status: string;
  }>;
  totalStake: string;
  activeCount: number;
}

export interface AccountProfile {
  address: string;
  riskFlags: string[];
  kycTier: 'none' | 'basic' | 'verified' | 'enterprise';
  velocityLimits: {
    dailyTxLimit: number;
    dailyValueLimit: string;
    remainingTx: number;
    remainingValue: string;
  };
  complianceScore: number;
}

@Injectable()
export class RPCExtensionsService {
  constructor(private readonly rpcService: RpcService) {}

  /**
   * Get finality status for a block or transaction
   */
  async getFinality(blockOrTx: string | number): Promise<FinalityStatus> {
    // In production, this would check PoSA finality rules
    // For now, simulate based on block age
    let blockNumber: number;

    if (typeof blockOrTx === 'string') {
      // Transaction hash - get block number from tx
      const tx = await this.rpcService.getProvider().getTransaction(blockOrTx);
      if (!tx || !tx.blockNumber) {
        return {
          status: 'unsafe',
          blockNumber: 0,
          confidence: 0,
          timestamp: new Date(),
        };
      }
      blockNumber = tx.blockNumber;
    } else {
      blockNumber = blockOrTx;
    }

    const currentBlock = await this.rpcService.getProvider().getBlockNumber();
    const confirmations = currentBlock - blockNumber;

    // PoSA finality: safe after 1 block, final after 2 blocks
    let status: 'unsafe' | 'safe' | 'final';
    let confidence: number;

    if (confirmations >= 2) {
      status = 'final';
      confidence = 100;
    } else if (confirmations >= 1) {
      status = 'safe';
      confidence = 95;
    } else {
      status = 'unsafe';
      confidence = 50;
    }

    const block = await this.rpcService.getProvider().getBlock(blockNumber);
    return {
      status,
      blockNumber,
      confidence,
      timestamp: new Date((block?.timestamp || 0) * 1000),
    };
  }

  /**
   * Get fee history with enhanced data
   */
  async getFeeHistoryPlus(
    blockCount: number,
    newestBlock: string | number,
    rewardPercentiles: number[],
  ) {
    // Get standard fee history
    const feeHistory = await this.rpcService
      .getProvider()
      .send('eth_feeHistory', [
        `0x${blockCount.toString(16)}`,
        typeof newestBlock === 'string'
          ? newestBlock
          : `0x${newestBlock.toString(16)}`,
        rewardPercentiles,
      ]);

    // Calculate additional metrics
    const gasUsedRatios = feeHistory.gasUsedRatio || [];
    const baseFees = feeHistory.baseFeePerGas || [];
    const rewards = feeHistory.reward || [];

    // Calculate percentiles
    const percentileMap: Record<number, string[]> = {};
    rewardPercentiles.forEach((p) => {
      percentileMap[p] = rewards.map(
        (r: string[]) => r[rewardPercentiles.indexOf(p)] || '0x0',
      );
    });

    // Calculate predictive fees (simplified)
    const avgBaseFee =
      baseFees.length > 0
        ? baseFees.reduce((sum: bigint, fee: string) => sum + BigInt(fee), 0n) /
          BigInt(baseFees.length)
        : 0n;

    const predictedFee = avgBaseFee + avgBaseFee / 10n; // 10% buffer

    return {
      ...feeHistory,
      predictedBaseFee: `0x${predictedFee.toString(16)}`,
      percentiles: percentileMap,
      averageGasUsedRatio:
        gasUsedRatios.length > 0
          ? gasUsedRatios.reduce((sum: number, r: number) => sum + r, 0) /
            gasUsedRatios.length
          : 0,
    };
  }

  /**
   * Get account profile (risk flags, KYC tier, velocity limits)
   */
  async getAccountProfile(address: string): Promise<AccountProfile> {
    // In production, this would query compliance and velocity services
    // For now, return mock data
    return {
      address: address.toLowerCase(),
      riskFlags: [],
      kycTier: 'none',
      velocityLimits: {
        dailyTxLimit: 100,
        dailyValueLimit: '1000000000000000000000', // 1000 tokens
        remainingTx: 100,
        remainingValue: '1000000000000000000000',
      },
      complianceScore: 0,
    };
  }

  /**
   * Get state proof for multiple keys
   */
  async getStateProof(
    keys: string[],
    blockNumber: number,
  ): Promise<StateProof> {
    // In production, this would generate Merkle proofs
    // For now, return mock proof
    const values = await Promise.all(
      keys.map(async (key) => {
        // Get storage value (simplified)
        return '0x0';
      }),
    );

    return {
      keys,
      values,
      proof: `0x${randomBytes(32).toString('hex')}`, // Mock proof
      blockNumber,
    };
  }

  /**
   * Get validator set information
   */
  async getValidatorSet(
    tag: 'current' | 'next' = 'current',
  ): Promise<ValidatorSetInfo> {
    // In production, this would query validator registry
    // For now, return mock data
    return {
      validators: [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          stake: '10000000000000000000000',
          uptime: 99.5,
          complianceScore: 95,
          status: 'active',
        },
      ],
      totalStake: '10000000000000000000000',
      activeCount: 1,
    };
  }
}
