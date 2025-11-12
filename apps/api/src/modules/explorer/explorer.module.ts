import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExplorerBlocksController } from './explorer-blocks.controller';
import { ExplorerTransactionsController } from './explorer-transactions.controller';
import { ExplorerAccountsController } from './explorer-accounts.controller';
import { ExplorerStatsController } from './explorer-stats.controller';
import { ExplorerContractsController } from './explorer-contracts.controller';
import { ExplorerTokensController } from './explorer-tokens.controller';
import { BlockModule } from '../block/block.module';
import { TransactionModule } from '../transaction/transaction.module';
import { AccountModule } from '../account/account.module';
import { StatsModule } from '../stats/stats.module';
import { ContractModule } from '../contract/contract.module';
import { TokenModule } from '../token/token.module';
import { Transaction } from '../transaction/entities/transaction.entity';
import { TokenHolder } from '../token/entities/token-holder.entity';

@Module({
  imports: [
    BlockModule,
    TransactionModule,
    AccountModule,
    StatsModule,
    ContractModule,
    TokenModule,
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [
    ExplorerBlocksController,
    ExplorerTransactionsController,
    ExplorerAccountsController,
    ExplorerStatsController,
    ExplorerContractsController,
    ExplorerTokensController,
  ],
})
export class ExplorerModule {}

