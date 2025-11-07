/**
 * GraphQL Library Exports
 * Main entry point for GraphQL functionality
 */

// Client
export {
  graphqlClient,
  createGraphQLClient,
  executeQuery,
  subscribeToQuery,
} from './client';

// Schema
export { typeDefs } from './schema';

// Resolvers
export { resolvers } from './resolvers';

// Scalars
export { customScalars } from './scalars';

// Context
export { createContext, loggingPlugin } from './context';
export type { GraphQLContext } from './context';

// DataLoaders
export { createDataLoaders } from './dataloaders';
export type { DataLoaderContext } from './dataloaders';

// Queries
export {
  GET_LATEST_BLOCKS,
  GET_BLOCK,
  GET_BLOCKS,
  GET_TRANSACTION,
  GET_LATEST_TRANSACTIONS,
  GET_ACCOUNT,
  GET_ACCOUNT_WITH_TRANSACTIONS,
  GET_ACCOUNT_BALANCE_HISTORY,
  GET_CONTRACT,
  GET_TOKEN,
  GET_NETWORK_STATS,
  SEARCH,
  GET_VALIDATORS,
  GET_ACTIVE_VALIDATORS,
} from './queries';

// Subscriptions
export {
  SUBSCRIBE_NEW_BLOCK,
  SUBSCRIBE_NEW_TRANSACTION,
  SUBSCRIBE_ACCOUNT_ACTIVITY,
  SUBSCRIBE_CONTRACT_EVENTS,
  SUBSCRIBE_STATS_UPDATED,
} from './subscriptions-examples';

// Subscription publishers
export {
  publishNewBlock,
  publishNewTransaction,
  publishContractEvent,
  publishStatsUpdate,
  EVENTS,
} from './resolvers/subscriptions';

// Examples
export {
  getLatestBlocks,
  getBlockDetails,
  getTransactionDetails,
  getAccountAnalytics,
  getAccountTransactions,
  getContractDetails,
  getTokenInfo,
  getNetworkStats,
  searchBlockchain,
  subscribeToNewBlocks,
  subscribeToNewTransactions,
  monitorAccount,
  monitorContractEvents,
  batchGetBlocks,
  BlockchainDashboard,
} from './examples';
