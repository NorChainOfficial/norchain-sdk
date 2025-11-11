/**
 * Token-related types
 */

import type { Address, Hash, Wei, Timestamp } from './common';

/**
 * Token standard type
 */
export type TokenStandard = 'ERC20' | 'ERC721' | 'ERC1155';

/**
 * Token information
 */
export interface Token {
  readonly contractAddress: Address;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly totalSupply: Wei;
  readonly type: TokenStandard;
  readonly logoUri?: string;
  readonly website?: string;
  readonly description?: string;
  readonly verified: boolean;
}

/**
 * Token metadata (extended info)
 */
export interface TokenMetadata {
  readonly contractAddress: Address;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly totalSupply: Wei;
  readonly type: TokenStandard;
  readonly holders?: number;
  readonly transfers?: number;
  readonly logoUri?: string;
  readonly website?: string;
  readonly socialMedia?: {
    readonly twitter?: string;
    readonly telegram?: string;
    readonly discord?: string;
  };
  readonly createdAt?: Timestamp;
}

/**
 * Token transfer event
 */
export interface TokenTransfer {
  readonly hash: Hash;
  readonly blockNumber: number;
  readonly timestamp: Timestamp;
  readonly from: Address;
  readonly to: Address;
  readonly value: Wei;
  readonly tokenAddress: Address;
  readonly tokenName: string;
  readonly tokenSymbol: string;
  readonly tokenDecimals: number;
  readonly transactionIndex?: number;
  readonly logIndex?: number;
}

/**
 * NFT transfer event
 */
export interface NFTTransfer {
  readonly hash: Hash;
  readonly blockNumber: number;
  readonly timestamp: Timestamp;
  readonly from: Address;
  readonly to: Address;
  readonly tokenId: string;
  readonly tokenAddress: Address;
  readonly tokenName: string;
  readonly tokenSymbol: string;
  readonly type: 'ERC721' | 'ERC1155';
  readonly amount?: string;
  readonly transactionIndex?: number;
  readonly logIndex?: number;
}

/**
 * Token holder information
 */
export interface TokenHolder {
  readonly address: Address;
  readonly balance: Wei;
  readonly balanceFormatted: string;
  readonly percentage: string;
  readonly isContract: boolean;
}

/**
 * Token price information
 */
export interface TokenPrice {
  readonly contractAddress: Address;
  readonly symbol: string;
  readonly priceUsd: string;
  readonly priceChange24h: string;
  readonly volume24h: string;
  readonly marketCap: string;
  readonly updatedAt: Timestamp;
}

/**
 * NFT metadata
 */
export interface NFTMetadata {
  readonly tokenId: string;
  readonly contractAddress: Address;
  readonly name: string;
  readonly description?: string;
  readonly image?: string;
  readonly animationUrl?: string;
  readonly attributes?: readonly NFTAttribute[];
  readonly owner?: Address;
}

/**
 * NFT attribute
 */
export interface NFTAttribute {
  readonly traitType: string;
  readonly value: string | number;
  readonly displayType?: string;
}
