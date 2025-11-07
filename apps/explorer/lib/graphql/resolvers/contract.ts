/**
 * Contract Type Resolvers
 * Resolve nested fields for Contract type
 */

import type { DataLoaderContext } from '../dataloaders';
import type { Contract, Account, Transaction } from '../../types';
import { ethers } from 'ethers';

interface Context {
  dataloaders: DataLoaderContext;
  provider: ethers.JsonRpcProvider;
}

interface EventsArgs {
  first?: number;
  after?: string;
  eventName?: string;
  fromBlock?: number;
  toBlock?: number;
}

export const contractResolvers = {
  // Resolve contract account
  async account(
    contract: Contract,
    _args: unknown,
    context: Context
  ): Promise<Account | null> {
    return context.dataloaders.accountLoader.load(contract.contract_address);
  },

  // Resolve contract creator
  async creator(
    contract: Contract,
    _args: unknown,
    context: Context
  ): Promise<Account | null> {
    if (!contract.metadata?.creator_address) return null;
    return context.dataloaders.accountLoader.load(contract.metadata.creator_address);
  },

  // Resolve creation transaction
  async creationTransaction(
    contract: Contract,
    _args: unknown,
    context: Context
  ): Promise<Transaction | null> {
    if (!contract.metadata?.creation_transaction_hash) return null;
    return context.dataloaders.transactionLoader.load(
      contract.metadata.creation_transaction_hash
    );
  },

  // Get contract events
  async events(contract: Contract, args: EventsArgs, context: Context): Promise<any[]> {
    // This would query events from database
    return [];
  },

  // Get internal transactions
  async internalTransactions(
    contract: Contract,
    args: { first?: number; after?: string },
    context: Context
  ): Promise<any[]> {
    // This would query internal transactions from database
    return [];
  },

  // Get token info if contract is a token
  async tokenInfo(
    contract: Contract,
    _args: unknown,
    context: Context
  ): Promise<any | null> {
    if (!contract.metadata?.is_token) return null;

    return {
      isToken: true,
      tokenType: contract.metadata.token_type,
      name: contract.metadata.token_name,
      symbol: contract.metadata.token_symbol,
      decimals: contract.metadata.token_decimals,
      totalSupply: '0', // Would query from contract
    };
  },

  // Calculate contract analytics
  async analytics(contract: Contract, _args: unknown, context: Context): Promise<any> {
    return {
      totalTransactions: contract.metadata?.total_transactions || 0,
      uniqueUsers: 0,
      totalValueLocked: null,
      createdAt: contract.metadata?.first_seen || new Date().toISOString(),
      lastActive: contract.metadata?.last_active || null,
    };
  },
};
