import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

/**
 * PubSub Service for GraphQL Subscriptions
 *
 * Provides a centralized PubSub instance for GraphQL subscriptions.
 * Uses in-memory PubSub by default. For production, consider Redis PubSub.
 *
 * Note: PubSub extends PubSubEngine which has asyncIterableIterator method
 */
@Injectable()
export class PubSubService extends PubSub {
  constructor() {
    super();
  }
}
