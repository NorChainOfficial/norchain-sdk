/**
 * GraphQL Client Usage Examples
 * Real-world usage patterns and best practices
 */

import {
  graphqlClient,
  executeQuery,
  subscribeToQuery,
  createGraphQLClient,
} from './client';
import {
  GET_LATEST_BLOCKS,
  GET_BLOCK,
  GET_TRANSACTION,
  GET_ACCOUNT,
  GET_ACCOUNT_WITH_TRANSACTIONS,
  GET_CONTRACT,
  GET_TOKEN,
  GET_NETWORK_STATS,
  SEARCH,
} from './queries';
import {
  SUBSCRIBE_NEW_BLOCK,
  SUBSCRIBE_NEW_TRANSACTION,
  SUBSCRIBE_ACCOUNT_ACTIVITY,
  SUBSCRIBE_CONTRACT_EVENTS,
} from './subscriptions-examples';

/**
 * Example 1: Get Latest Blocks
 */
export async function getLatestBlocks(limit = 10): Promise<any> {
  try {
    const data = await executeQuery(
      GET_LATEST_BLOCKS,
      { limit },
      { cachePolicy: 'network-only' }
    );

    console.log(`Fetched ${data.latestBlocks.length} blocks`);
    return data.latestBlocks;
  } catch (error) {
    console.error('Error fetching latest blocks:', error);
    throw error;
  }
}

/**
 * Example 2: Get Block with Full Details
 */
export async function getBlockDetails(height: number): Promise<any> {
  try {
    const data = await executeQuery(GET_BLOCK, { height });

    console.log(`Block ${height}:`, {
      hash: data.block.hash,
      transactions: data.block.transactionCount,
      gasUsed: data.block.gasUsed,
      stats: data.block.stats,
    });

    return data.block;
  } catch (error) {
    console.error(`Error fetching block ${height}:`, error);
    throw error;
  }
}

/**
 * Example 3: Get Transaction with Decoded Data
 */
export async function getTransactionDetails(hash: string): Promise<any> {
  try {
    const data = await executeQuery(GET_TRANSACTION, { hash });

    console.log(`Transaction ${hash}:`, {
      from: data.transaction.sender,
      to: data.transaction.receiver,
      amount: data.transaction.amount,
      status: data.transaction.status,
      decodedData: data.transaction.decodedData,
      events: data.transaction.events.length,
    });

    return data.transaction;
  } catch (error) {
    console.error(`Error fetching transaction ${hash}:`, error);
    throw error;
  }
}

/**
 * Example 4: Get Account with Analytics
 */
export async function getAccountAnalytics(address: string): Promise<any> {
  try {
    const data = await executeQuery(GET_ACCOUNT, { address });

    console.log(`Account ${address}:`, {
      balance: data.account.balance,
      txCount: data.account.txCount,
      type: data.account.type,
      analytics: data.account.analytics,
    });

    return data.account;
  } catch (error) {
    console.error(`Error fetching account ${address}:`, error);
    throw error;
  }
}

/**
 * Example 5: Paginated Account Transactions
 */
export async function getAccountTransactions(
  address: string,
  pageSize = 20
): Promise<any> {
  try {
    let allTransactions: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const data = await executeQuery(GET_ACCOUNT_WITH_TRANSACTIONS, {
        address,
        first: pageSize,
        after: cursor,
      });

      const transactions = data.account.transactions.edges.map(
        (edge: any) => edge.node
      );
      allTransactions = [...allTransactions, ...transactions];

      hasNextPage = data.account.transactions.pageInfo.hasNextPage;
      cursor = data.account.transactions.pageInfo.endCursor;

      console.log(
        `Loaded ${transactions.length} transactions (total: ${allTransactions.length})`
      );

      // Limit to prevent infinite loop
      if (allTransactions.length >= 100) break;
    }

    return allTransactions;
  } catch (error) {
    console.error(`Error fetching account transactions:`, error);
    throw error;
  }
}

/**
 * Example 6: Get Contract Details
 */
export async function getContractDetails(address: string): Promise<any> {
  try {
    const data = await executeQuery(GET_CONTRACT, { address });

    if (!data.contract) {
      console.log(`No contract found at ${address}`);
      return null;
    }

    console.log(`Contract ${address}:`, {
      name: data.contract.contractName,
      verified: data.contract.isVerified,
      compiler: data.contract.compilerVersion,
      isToken: data.contract.tokenInfo?.isToken,
      analytics: data.contract.analytics,
    });

    return data.contract;
  } catch (error) {
    console.error(`Error fetching contract ${address}:`, error);
    throw error;
  }
}

/**
 * Example 7: Get Token Information
 */
export async function getTokenInfo(address: string): Promise<any> {
  try {
    const data = await executeQuery(GET_TOKEN, { address });

    if (!data.token) {
      console.log(`No token found at ${address}`);
      return null;
    }

    console.log(`Token ${data.token.symbol}:`, {
      name: data.token.name,
      totalSupply: data.token.totalSupply,
      holders: data.token.holders,
      volume24h: data.token.volume24h,
      price: data.token.price,
    });

    return data.token;
  } catch (error) {
    console.error(`Error fetching token ${address}:`, error);
    throw error;
  }
}

/**
 * Example 8: Get Network Statistics
 */
export async function getNetworkStats(): Promise<any> {
  try {
    const data = await executeQuery(GET_NETWORK_STATS, {});

    console.log('Network Stats:', {
      totalBlocks: data.stats.totalBlocks,
      totalTransactions: data.stats.totalTransactions,
      blocks24h: data.stats.blocks24h,
      transactions24h: data.stats.transactions24h,
      avgBlockTime: data.stats.avgBlockTime,
    });

    return data.stats;
  } catch (error) {
    console.error('Error fetching network stats:', error);
    throw error;
  }
}

/**
 * Example 9: Search Blockchain
 */
export async function searchBlockchain(query: string): Promise<any> {
  try {
    const data = await executeQuery(SEARCH, { query });

    console.log(`Search results for "${query}":`, {
      count: data.search.length,
      types: data.search.map((r: any) => r.type),
    });

    return data.search;
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    throw error;
  }
}

/**
 * Example 10: Subscribe to New Blocks
 */
export function subscribeToNewBlocks(
  callback: (block: any) => void
): () => void {
  console.log('Subscribing to new blocks...');

  return subscribeToQuery(
    SUBSCRIBE_NEW_BLOCK,
    {},
    {
      onData: (data: any) => {
        console.log('New block:', data.newBlock.height);
        callback(data.newBlock);
      },
      onError: (error: Error) => {
        console.error('Subscription error:', error);
      },
    }
  );
}

/**
 * Example 11: Subscribe to New Transactions
 */
export function subscribeToNewTransactions(
  callback: (tx: any) => void
): () => void {
  console.log('Subscribing to new transactions...');

  return subscribeToQuery(
    SUBSCRIBE_NEW_TRANSACTION,
    {},
    {
      onData: (data: any) => {
        console.log('New transaction:', data.newTransaction.hash);
        callback(data.newTransaction);
      },
      onError: (error: Error) => {
        console.error('Subscription error:', error);
      },
    }
  );
}

/**
 * Example 12: Monitor Account Activity
 */
export function monitorAccount(
  address: string,
  callback: (tx: any) => void
): () => void {
  console.log(`Monitoring account ${address}...`);

  return subscribeToQuery(
    SUBSCRIBE_ACCOUNT_ACTIVITY,
    { address },
    {
      onData: (data: any) => {
        console.log('Account activity:', data.accountActivity.hash);
        callback(data.accountActivity);
      },
      onError: (error: Error) => {
        console.error('Subscription error:', error);
      },
    }
  );
}

/**
 * Example 13: Monitor Contract Events
 */
export function monitorContractEvents(
  address: string,
  eventName?: string,
  callback?: (event: any) => void
): () => void {
  console.log(
    `Monitoring contract ${address}${eventName ? ` for ${eventName} events` : ''}...`
  );

  return subscribeToQuery(
    SUBSCRIBE_CONTRACT_EVENTS,
    { address, eventName },
    {
      onData: (data: any) => {
        console.log('Contract event:', data.contractEvents.eventName);
        callback?.(data.contractEvents);
      },
      onError: (error: Error) => {
        console.error('Subscription error:', error);
      },
    }
  );
}

/**
 * Example 14: Batch Queries with DataLoader
 */
export async function batchGetBlocks(heights: number[]): Promise<any[]> {
  try {
    console.log(`Fetching ${heights.length} blocks in batch...`);

    // These will be automatically batched by DataLoader
    const promises = heights.map((height) =>
      executeQuery(GET_BLOCK, { height })
    );

    const results = await Promise.all(promises);
    const blocks = results.map((r) => r.block);

    console.log(`Successfully fetched ${blocks.length} blocks`);
    return blocks;
  } catch (error) {
    console.error('Error in batch fetch:', error);
    throw error;
  }
}

/**
 * Example 15: Using Custom API Key
 */
export async function getDataWithPremiumKey(
  apiKey: string
): Promise<any> {
  try {
    console.log('Using premium API key...');

    const client = createGraphQLClient(apiKey);

    const { data } = await client.query({
      query: GET_NETWORK_STATS,
    });

    console.log('Premium request successful');
    return data.stats;
  } catch (error) {
    console.error('Error with premium key:', error);
    throw error;
  }
}

/**
 * Example 16: Real-time Dashboard
 */
export class BlockchainDashboard {
  private unsubscribers: Array<() => void> = [];

  start(): void {
    console.log('Starting blockchain dashboard...');

    // Subscribe to new blocks
    this.unsubscribers.push(
      subscribeToNewBlocks((block) => {
        this.handleNewBlock(block);
      })
    );

    // Subscribe to new transactions
    this.unsubscribers.push(
      subscribeToNewTransactions((tx) => {
        this.handleNewTransaction(tx);
      })
    );

    // Fetch initial stats
    this.updateStats();
  }

  stop(): void {
    console.log('Stopping blockchain dashboard...');
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
  }

  private handleNewBlock(block: any): void {
    console.log(`Dashboard: New block ${block.height}`);
    // Update UI with new block
  }

  private handleNewTransaction(tx: any): void {
    console.log(`Dashboard: New transaction ${tx.hash}`);
    // Update UI with new transaction
  }

  private async updateStats(): Promise<void> {
    try {
      const stats = await getNetworkStats();
      console.log('Dashboard: Updated stats', stats);
      // Update UI with stats
    } catch (error) {
      console.error('Dashboard: Error updating stats', error);
    }
  }
}

/**
 * Example 17: Error Handling Patterns
 */
export async function robustGetBlock(height: number): Promise<any | null> {
  try {
    return await getBlockDetails(height);
  } catch (error: any) {
    if (error.message.includes('Rate limit')) {
      console.log('Rate limited, waiting 60s...');
      await new Promise((resolve) => setTimeout(resolve, 60000));
      return robustGetBlock(height); // Retry
    }

    if (error.message.includes('not found')) {
      console.log(`Block ${height} not found`);
      return null;
    }

    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Example Usage
 */
export async function runExamples(): Promise<void> {
  try {
    // Get latest blocks
    await getLatestBlocks(5);

    // Get specific block
    await getBlockDetails(12345);

    // Search
    await searchBlockchain('0x1234');

    // Get network stats
    await getNetworkStats();

    // Start real-time monitoring
    const dashboard = new BlockchainDashboard();
    dashboard.start();

    // Stop after 30 seconds
    setTimeout(() => {
      dashboard.stop();
    }, 30000);
  } catch (error) {
    console.error('Example error:', error);
  }
}
