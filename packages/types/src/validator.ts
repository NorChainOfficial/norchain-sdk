/**
 * Validator and staking-related types
 */

import type { Address, Wei, Timestamp } from './common';

/**
 * Validator status
 */
export type ValidatorStatus = 'active' | 'inactive' | 'jailed' | 'pending';

/**
 * Validator detailed information
 */
export interface ValidatorDetails {
  readonly address: Address;
  readonly operatorAddress?: Address;
  readonly moniker: string;
  readonly website?: string;
  readonly description?: string;
  readonly commission: {
    readonly rate: string;
    readonly maxRate: string;
    readonly maxChangeRate: string;
  };
  readonly status: ValidatorStatus;
  readonly stake: Wei;
  readonly delegatorShares: Wei;
  readonly votingPower: string;
  readonly uptime: number;
  readonly missedBlocks: number;
  readonly signedBlocks: number;
  readonly jailedUntil?: Timestamp;
  readonly joinedAt: Timestamp;
  readonly lastActiveAt: Timestamp;
}

/**
 * Delegation information
 */
export interface Delegation {
  readonly delegatorAddress: Address;
  readonly validatorAddress: Address;
  readonly shares: Wei;
  readonly balance: Wei;
  readonly rewards: Wei;
  readonly createdAt: Timestamp;
}

/**
 * Staking rewards
 */
export interface StakingRewards {
  readonly validatorAddress: Address;
  readonly delegatorAddress: Address;
  readonly amount: Wei;
  readonly amountFormatted: string;
  readonly lastClaimedAt?: Timestamp;
}

/**
 * Validator performance metrics
 */
export interface ValidatorPerformance {
  readonly address: Address;
  readonly uptime30d: number;
  readonly uptime7d: number;
  readonly blocksProposed: number;
  readonly blocksMissed: number;
  readonly slashingEvents: number;
  readonly averageBlockTime: number;
}

/**
 * Unbonding delegation
 */
export interface UnbondingDelegation {
  readonly delegatorAddress: Address;
  readonly validatorAddress: Address;
  readonly amount: Wei;
  readonly completionTime: Timestamp;
  readonly createdAt: Timestamp;
}
