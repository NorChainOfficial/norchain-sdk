import { Resolver, Subscription, Args, Context } from '@nestjs/graphql';
import { PubSubService } from '../pubsub.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnModuleInit, Logger } from '@nestjs/common';
import { Block } from '../types/block.type';
import { Transaction } from '../types/transaction.type';

@Resolver()
export class SubscriptionResolver implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionResolver.name);

  constructor(
    private readonly pubSub: PubSubService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    // Listen to internal events and publish to GraphQL subscriptions
    this.eventEmitter.on('block.new', (block: any) => {
      this.pubSub.publish('blockAdded', { blockAdded: block });
    });

    this.eventEmitter.on('transaction.new', (transaction: any) => {
      this.pubSub.publish('transactionAdded', {
        transactionAdded: transaction,
      });
    });

    this.eventEmitter.on('policy.check', (policy: any) => {
      if (policy.userId) {
        this.pubSub.publish(`policyCheck:${policy.userId}`, {
          policyCheck: policy,
        });
      }
    });
  }

  @Subscription(() => Block, {
    name: 'blockAdded',
    description: 'Subscribe to new blocks',
  })
  subscribeToBlocks() {
    return this.pubSub.asyncIterableIterator('blockAdded');
  }

  @Subscription(() => Transaction, {
    name: 'transactionAdded',
    description: 'Subscribe to new transactions',
    filter: (payload: any, variables: any) => {
      if (variables?.address) {
        return (
          payload.transactionAdded?.from?.toLowerCase() ===
            variables.address.toLowerCase() ||
          payload.transactionAdded?.to?.toLowerCase() ===
            variables.address.toLowerCase()
        );
      }
      return true;
    },
  })
  subscribeToTransactions(
    @Args('address', { nullable: true }) address?: string,
  ) {
    return this.pubSub.asyncIterableIterator('transactionAdded');
  }

  @Subscription(() => Transaction, {
    name: 'transactionByAddress',
    description: 'Subscribe to transactions for a specific address',
  })
  subscribeToTransactionsByAddress(@Args('address') address: string) {
    return this.pubSub.asyncIterableIterator(
      `transaction:${address.toLowerCase()}`,
    );
  }

  @Subscription(() => Object, {
    name: 'policyCheck',
    description: 'Subscribe to policy check events for authenticated user',
    resolve: (payload: any) => payload.policyCheck,
  })
  subscribeToPolicyChecks(@Context() context: any) {
    const userId = context?.req?.user?.id;
    if (!userId) {
      throw new Error('Authentication required for policy subscriptions');
    }
    return this.pubSub.asyncIterableIterator(`policyCheck:${userId}`);
  }
}
