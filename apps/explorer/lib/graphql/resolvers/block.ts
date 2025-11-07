/**
 * Block Type Resolvers
 * Resolve nested fields for Block type with DataLoader optimization
 */

import type { DataLoaderContext } from '../dataloaders';
import type { Block, Transaction, Account } from '../../types';

interface Context {
  dataloaders: DataLoaderContext;
}

interface BlockTransactionsArgs {
  first?: number;
  after?: string;
  filter?: any;
}

export const blockResolvers = {
  // Resolve proposer account
  async proposer(block: Block, _args: unknown, context: Context): Promise<Account | null> {
    if (!block.proposer_address) return null;
    return context.dataloaders.accountLoader.load(block.proposer_address);
  },

  // Resolve transactions in block
  async transactions(
    block: Block,
    args: BlockTransactionsArgs,
    context: Context
  ): Promise<any> {
    const first = args.first || 20;
    const transactions = await context.dataloaders.transactionsByBlockLoader.load(
      block.height
    );

    const edges = transactions.slice(0, first).map((tx, index) => ({
      cursor: `${block.height}-${index}`,
      node: tx,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: transactions.length > first,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: transactions.length,
    };
  },

  // Calculate block statistics
  async stats(block: Block, _args: unknown, context: Context): Promise<any> {
    const transactions = await context.dataloaders.transactionsByBlockLoader.load(
      block.height
    );

    let totalFees = BigInt(0);
    let successCount = 0;

    for (const tx of transactions) {
      if (tx.fee) {
        totalFees += BigInt(tx.fee);
      }
      if (tx.status === 'success') {
        successCount++;
      }
    }

    const avgGasPrice =
      transactions.length > 0
        ? totalFees / BigInt(transactions.length)
        : BigInt(0);

    const successRate =
      transactions.length > 0 ? (successCount / transactions.length) * 100 : 0;

    return {
      avgGasPrice: avgGasPrice.toString(),
      totalFees: totalFees.toString(),
      successRate,
    };
  },
};
