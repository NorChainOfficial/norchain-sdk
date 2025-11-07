/**
 * GraphQL Resolvers
 * Main resolver exports
 */

import { queryResolvers } from './query';
import { blockResolvers } from './block';
import { transactionResolvers } from './transaction';
import { accountResolvers } from './account';
import { contractResolvers } from './contract';
import { tokenResolvers } from './token';
import { validatorResolvers } from './validator';
import { subscriptionResolvers } from './subscriptions';
import { customScalars } from '../scalars';

export const resolvers = {
  // Custom scalars
  ...customScalars,

  // Queries
  Query: queryResolvers,

  // Type resolvers
  Block: blockResolvers,
  Transaction: transactionResolvers,
  Account: accountResolvers,
  Contract: contractResolvers,
  Token: tokenResolvers,
  Validator: validatorResolvers,

  // Subscriptions
  Subscription: subscriptionResolvers,

  // Union resolvers
  SearchResultUnion: {
    __resolveType(obj: any): string {
      if (obj.height !== undefined) return 'Block';
      if (obj.hash && obj.block_height !== undefined) return 'Transaction';
      if (obj.balance !== undefined) return 'Account';
      if (obj.contract_address) return 'Contract';
      if (obj.symbol && obj.decimals !== undefined) return 'Token';
      return 'Account';
    },
  },
};
