/**
 * Query Resolvers
 * Root query field resolvers with DataLoader optimization
 */

import type { DataLoaderContext } from '../dataloaders';
import { ethers } from 'ethers';
import type { Block, Transaction, Account } from '../../types';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

interface Context {
  dataloaders: DataLoaderContext;
  provider: ethers.JsonRpcProvider;
  apiKey?: string;
  requestId: string;
}

interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export const queryResolvers = {
  // Block queries
  async block(
    _parent: unknown,
    args: { height: number },
    context: Context
  ): Promise<Block | null> {
    return context.dataloaders.blockLoader.load(args.height);
  },

  async blockByHash(
    _parent: unknown,
    args: { hash: string },
    context: Context
  ): Promise<Block | null> {
    return context.dataloaders.blockByHashLoader.load(args.hash);
  },

  async blocks(
    _parent: unknown,
    args: PaginationArgs & { filter?: any },
    context: Context
  ): Promise<any> {
    const first = args.first || 20;
    const after = args.after ? parseInt(args.after) : null;

    const provider = context.provider;
    const latestBlockNumber = await provider.getBlockNumber();

    const startBlock = after !== null ? after - 1 : latestBlockNumber;
    const endBlock = Math.max(0, startBlock - first);

    const heights = [];
    for (let i = startBlock; i > endBlock && heights.length < first; i--) {
      heights.push(i);
    }

    const blocks = await Promise.all(
      heights.map((height) => context.dataloaders.blockLoader.load(height))
    );

    const edges = blocks
      .filter((block): block is Block => block !== null)
      .map((block) => ({
        cursor: block.height.toString(),
        node: block,
      }));

    return {
      edges,
      pageInfo: {
        hasNextPage: endBlock > 0,
        hasPreviousPage: after !== null,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: latestBlockNumber + 1,
    };
  },

  async latestBlocks(
    _parent: unknown,
    args: { limit?: number },
    context: Context
  ): Promise<Block[]> {
    const limit = Math.min(args.limit || 10, 50);
    const provider = context.provider;
    const latestBlockNumber = await provider.getBlockNumber();

    const heights = [];
    for (let i = 0; i < limit; i++) {
      heights.push(latestBlockNumber - i);
    }

    const blocks = await Promise.all(
      heights.map((height) => context.dataloaders.blockLoader.load(height))
    );

    return blocks.filter((block): block is Block => block !== null);
  },

  // Transaction queries
  async transaction(
    _parent: unknown,
    args: { hash: string },
    context: Context
  ): Promise<Transaction | null> {
    return context.dataloaders.transactionLoader.load(args.hash);
  },

  async transactions(
    _parent: unknown,
    args: PaginationArgs & { filter?: any },
    context: Context
  ): Promise<any> {
    const first = args.first || 20;
    const provider = context.provider;

    // Get latest blocks and their transactions
    const latestBlockNumber = await provider.getBlockNumber();
    const blockHeights = [];

    for (let i = 0; i < 10; i++) {
      blockHeights.push(latestBlockNumber - i);
    }

    const blockTransactions = await Promise.all(
      blockHeights.map((height) =>
        context.dataloaders.transactionsByBlockLoader.load(height)
      )
    );

    const allTransactions = blockTransactions.flat().slice(0, first);

    const edges = allTransactions.map((tx, index) => ({
      cursor: `${tx.block_height}-${index}`,
      node: tx,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: 0, // Would need database for accurate count
    };
  },

  async latestTransactions(
    _parent: unknown,
    args: { limit?: number },
    context: Context
  ): Promise<Transaction[]> {
    const limit = Math.min(args.limit || 10, 50);
    const provider = context.provider;
    const latestBlockNumber = await provider.getBlockNumber();

    const transactions: Transaction[] = [];
    let blockOffset = 0;

    while (transactions.length < limit && blockOffset < 20) {
      const blockHeight = latestBlockNumber - blockOffset;
      const blockTxs = await context.dataloaders.transactionsByBlockLoader.load(
        blockHeight
      );
      transactions.push(...blockTxs);
      blockOffset++;
    }

    return transactions.slice(0, limit);
  },

  // Account queries
  async account(
    _parent: unknown,
    args: { address: string },
    context: Context
  ): Promise<Account | null> {
    return context.dataloaders.accountLoader.load(args.address);
  },

  async accounts(
    _parent: unknown,
    args: PaginationArgs & { filter?: any; orderBy?: any },
    context: Context
  ): Promise<any> {
    // This would typically query a database
    // For now, return empty connection
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    };
  },

  async topAccounts(
    _parent: unknown,
    args: { limit?: number },
    context: Context
  ): Promise<Account[]> {
    // This would typically query a database with ORDER BY balance DESC
    return [];
  },

  // Contract queries
  async contract(
    _parent: unknown,
    args: { address: string },
    context: Context
  ): Promise<any> {
    return context.dataloaders.contractLoader.load(args.address);
  },

  async verifiedContracts(
    _parent: unknown,
    args: PaginationArgs,
    context: Context
  ): Promise<any[]> {
    // This would query a database of verified contracts
    return [];
  },

  // Token queries
  async token(
    _parent: unknown,
    args: { address: string },
    context: Context
  ): Promise<any> {
    // Would load from token registry
    return null;
  },

  async tokens(
    _parent: unknown,
    args: PaginationArgs & { filter?: any },
    context: Context
  ): Promise<any> {
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    };
  },

  async topTokens(
    _parent: unknown,
    args: { limit?: number },
    context: Context
  ): Promise<any[]> {
    return [];
  },

  // Validator queries
  async validator(
    _parent: unknown,
    args: { operatorAddress: string },
    context: Context
  ): Promise<any> {
    // Would query validator database
    return null;
  },

  async validators(_parent: unknown, _args: unknown, context: Context): Promise<any[]> {
    // Would query all validators
    return [];
  },

  async activeValidators(
    _parent: unknown,
    _args: unknown,
    context: Context
  ): Promise<any[]> {
    return [];
  },

  // Network stats
  async stats(_parent: unknown, _args: unknown, context: Context): Promise<any> {
    const provider = context.provider;
    const latestBlockNumber = await provider.getBlockNumber();
    const latestBlock = await context.dataloaders.blockLoader.load(latestBlockNumber);

    return {
      latestBlock,
      totalBlocks: latestBlockNumber + 1,
      totalTransactions: 0, // Would need database
      totalAccounts: 0,
      totalValidators: 0,
      totalContracts: 0,
      blocks24h: 0,
      transactions24h: 0,
      avgBlockTime: 3.0,
      avgGasPrice: '0',
      activeValidators: 0,
      networkHashrate: '0',
      stakingRatio: 0,
      chartData: {
        blocks: [],
        transactions: [],
        gasUsed: [],
        activeAccounts: [],
      },
    };
  },

  // Search
  async search(
    _parent: unknown,
    args: { query: string },
    context: Context
  ): Promise<any[]> {
    const query = args.query.trim();
    const results = [];

    // Try as block height
    if (/^\d+$/.test(query)) {
      const height = parseInt(query);
      const block = await context.dataloaders.blockLoader.load(height);
      if (block) {
        results.push({
          type: 'BLOCK',
          result: block,
        });
      }
    }

    // Try as transaction hash
    if (query.startsWith('0x') && query.length === 66) {
      try {
        const tx = await context.dataloaders.transactionLoader.load(query);
        if (tx) {
          results.push({
            type: 'TRANSACTION',
            result: tx,
          });
        }
      } catch (error) {
        // Not a valid transaction
      }
    }

    // Try as address
    if (query.startsWith('0x') && query.length === 42) {
      try {
        const account = await context.dataloaders.accountLoader.load(query);
        if (account) {
          results.push({
            type: 'ACCOUNT',
            result: account,
          });
        }
      } catch (error) {
        // Not a valid address
      }
    }

    return results;
  },

  // Health check
  health(): boolean {
    return true;
  },
};
