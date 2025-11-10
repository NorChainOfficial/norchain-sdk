import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AccountResolver } from './resolvers/account.resolver';
import { TransactionResolver } from './resolvers/transaction.resolver';
import { BlockResolver } from './resolvers/block.resolver';
import { TokenResolver } from './resolvers/token.resolver';
import { MetadataResolver } from './resolvers/metadata.resolver';
import { SubscriptionResolver } from './resolvers/subscription.resolver';
import { PubSubService } from './pubsub.service';
import { AccountModule } from '../account/account.module';
import { TransactionModule } from '../transaction/transaction.module';
import { BlockModule } from '../block/block.module';
import { TokenModule } from '../token/token.module';
import { MetadataModule } from '../metadata/metadata.module';
import { forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req }) => ({ req }),
      formatError: (error) => {
        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_ERROR',
          path: error.path,
        };
      },
    }),
    forwardRef(() => AccountModule),
    forwardRef(() => TransactionModule),
    forwardRef(() => BlockModule),
    forwardRef(() => TokenModule),
    forwardRef(() => MetadataModule),
    EventEmitterModule,
  ],
  providers: [
    AccountResolver,
    TransactionResolver,
    BlockResolver,
    TokenResolver,
    MetadataResolver,
    SubscriptionResolver,
    PubSubService,
  ],
})
export class GraphQLApiModule {}
