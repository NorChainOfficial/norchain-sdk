/**
 * Core blockchain types
 */

import type { Address, Hash, Wei, Timestamp } from './common';

/**
 * Blockchain network information
 */
export interface NetworkInfo {
  readonly chainId: number;
  readonly networkName: string;
  readonly rpcUrl: string;
  readonly explorerUrl: string;
  readonly nativeCurrency: {
    readonly name: string;
    readonly symbol: string;
    readonly decimals: number;
  };
}

/**
 * Gas price information
 */
export interface GasPrice {
  readonly standard: Wei;
  readonly fast: Wei;
  readonly instant: Wei;
  readonly baseFee?: Wei;
  readonly priorityFee?: Wei;
}

/**
 * Validator information
 */
export interface Validator {
  readonly address: Address;
  readonly stake: Wei;
  readonly commission: string;
  readonly isActive: boolean;
  readonly votingPower: string;
  readonly uptime: number;
  readonly joinedAt: Timestamp;
  readonly lastActiveAt: Timestamp;
}

/**
 * State root information
 */
export interface StateRoot {
  readonly blockNumber: number;
  readonly stateRoot: Hash;
  readonly timestamp: Timestamp;
  readonly transactionCount: number;
}

/**
 * Consensus information
 */
export interface ConsensusInfo {
  readonly algorithm: 'PoS' | 'PoA' | 'DPoS';
  readonly blockTime: number;
  readonly epochLength: number;
  readonly currentEpoch: number;
  readonly validatorCount: number;
  readonly totalStake: Wei;
}

/**
 * Chain statistics
 */
export interface ChainStats {
  readonly blockHeight: number;
  readonly totalTransactions: number;
  readonly totalAccounts: number;
  readonly totalSupply: Wei;
  readonly circulatingSupply: Wei;
  readonly avgBlockTime: number;
  readonly tps: number;
  readonly gasPrice: GasPrice;
}

/**
 * Network status
 */
export interface NetworkStatus {
  readonly isHealthy: boolean;
  readonly latency: number;
  readonly blockHeight: number;
  readonly peerCount: number;
  readonly isSyncing: boolean;
  readonly syncProgress?: number;
}
