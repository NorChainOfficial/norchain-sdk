/**
 * Subscription Resolvers
 * Real-time GraphQL subscriptions using PubSub
 */

import { PubSub } from 'graphql-subscriptions';

// Create PubSub instance (in production, use Redis PubSub)
const pubsub = new PubSub();

// Subscription event names
export const EVENTS = {
  NEW_BLOCK: 'NEW_BLOCK',
  NEW_TRANSACTION: 'NEW_TRANSACTION',
  ACCOUNT_ACTIVITY: 'ACCOUNT_ACTIVITY',
  CONTRACT_EVENTS: 'CONTRACT_EVENTS',
  STATS_UPDATED: 'STATS_UPDATED',
};

export const subscriptionResolvers = {
  // Subscribe to new blocks
  newBlock: {
    subscribe: () => pubsub.asyncIterator([EVENTS.NEW_BLOCK]),
  },

  // Subscribe to new transactions
  newTransaction: {
    subscribe: () => pubsub.asyncIterator([EVENTS.NEW_TRANSACTION]),
  },

  // Subscribe to account activity
  accountActivity: {
    subscribe: (_parent: unknown, args: { address: string }) => {
      return pubsub.asyncIterator([`${EVENTS.ACCOUNT_ACTIVITY}_${args.address}`]);
    },
  },

  // Subscribe to contract events
  contractEvents: {
    subscribe: (_parent: unknown, args: { address: string; eventName?: string }) => {
      const channel = args.eventName
        ? `${EVENTS.CONTRACT_EVENTS}_${args.address}_${args.eventName}`
        : `${EVENTS.CONTRACT_EVENTS}_${args.address}`;
      return pubsub.asyncIterator([channel]);
    },
  },

  // Subscribe to network stats updates
  statsUpdated: {
    subscribe: () => pubsub.asyncIterator([EVENTS.STATS_UPDATED]),
  },
};

/**
 * Publish new block event
 */
export async function publishNewBlock(block: any): Promise<void> {
  await pubsub.publish(EVENTS.NEW_BLOCK, { newBlock: block });
}

/**
 * Publish new transaction event
 */
export async function publishNewTransaction(transaction: any): Promise<void> {
  await pubsub.publish(EVENTS.NEW_TRANSACTION, { newTransaction: transaction });

  // Also publish to account activity channels
  if (transaction.sender) {
    await pubsub.publish(
      `${EVENTS.ACCOUNT_ACTIVITY}_${transaction.sender}`,
      { accountActivity: transaction }
    );
  }
  if (transaction.receiver) {
    await pubsub.publish(
      `${EVENTS.ACCOUNT_ACTIVITY}_${transaction.receiver}`,
      { accountActivity: transaction }
    );
  }
}

/**
 * Publish contract event
 */
export async function publishContractEvent(
  address: string,
  eventName: string | null,
  event: any
): Promise<void> {
  await pubsub.publish(`${EVENTS.CONTRACT_EVENTS}_${address}`, {
    contractEvents: event,
  });

  if (eventName) {
    await pubsub.publish(`${EVENTS.CONTRACT_EVENTS}_${address}_${eventName}`, {
      contractEvents: event,
    });
  }
}

/**
 * Publish network stats update
 */
export async function publishStatsUpdate(stats: any): Promise<void> {
  await pubsub.publish(EVENTS.STATS_UPDATED, { statsUpdated: stats });
}
