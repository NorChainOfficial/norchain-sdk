import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { Block } from '../modules/block/entities/block.entity';
import { Transaction } from '../modules/transaction/entities/transaction.entity';
import { TransactionLog } from '../modules/transaction/entities/transaction-log.entity';
import { TokenTransfer } from '../modules/token/entities/token-transfer.entity';
import { NftTransfer } from '../modules/token/entities/nft-transfer.entity';
import { TokenHolder } from '../modules/token/entities/token-holder.entity';
import { Contract } from '../modules/contract/entities/contract.entity';
import { TokenMetadata } from '../modules/token/entities/token-metadata.entity';
import { ApiUsage } from '../modules/stats/entities/api-usage.entity';
import { User } from '../modules/auth/entities/user.entity';
import { ApiKey } from '../modules/auth/entities/api-key.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { LimitOrder } from '../modules/orders/entities/limit-order.entity';
import { DCASchedule } from '../modules/orders/entities/dca-schedule.entity';
import { StopLossOrder } from '../modules/orders/entities/stop-loss-order.entity';
import { Wallet } from '../modules/wallet/entities/wallet.entity';
import { BridgeTransfer } from '../modules/bridge/entities/bridge-transfer.entity';
import { ComplianceScreening } from '../modules/compliance/entities/compliance-screening.entity';
import { ComplianceCase } from '../modules/compliance/entities/compliance-case.entity';
import { GovernanceProposal } from '../modules/governance/entities/governance-proposal.entity';
import { GovernanceVote } from '../modules/governance/entities/governance-vote.entity';

// Load environment variables
config();

/**
 * TypeORM Data Source Configuration
 * Used for running migrations and CLI commands
 */
const useSupabase = process.env.USE_SUPABASE === 'true';
const supabaseDbUrl = process.env.SUPABASE_DB_URL;

const entities = [
  Block,
  Transaction,
  TransactionLog,
  TokenTransfer,
  NftTransfer,
  TokenHolder,
  Contract,
  TokenMetadata,
  ApiUsage,
  User,
  ApiKey,
  Notification,
    LimitOrder,
    DCASchedule,
    StopLossOrder,
    Wallet,
    BridgeTransfer,
    ComplianceScreening,
    ComplianceCase,
    GovernanceProposal,
    GovernanceVote,
];

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: useSupabase && supabaseDbUrl ? supabaseDbUrl : undefined,
  host: !useSupabase ? process.env.DB_HOST || 'localhost' : undefined,
  port: !useSupabase ? parseInt(process.env.DB_PORT || '5432') : undefined,
  username: !useSupabase ? process.env.DB_USER || 'postgres' : undefined,
  password: !useSupabase ? process.env.DB_PASSWORD || 'postgres' : undefined,
  database: !useSupabase
    ? process.env.DB_NAME || 'norchain_explorer'
    : undefined,
  entities,
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl:
    useSupabase && supabaseDbUrl
      ? { rejectUnauthorized: false }
      : process.env.DB_SSL
        ? { rejectUnauthorized: false }
        : false,
});
