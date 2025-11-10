import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
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

/**
 * Database Configuration
 *
 * Supports both Supabase and regular PostgreSQL.
 * If SUPABASE_DB_URL is provided, uses Supabase connection.
 * Otherwise, falls back to regular PostgreSQL connection.
 */
export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
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
  ];

  // Check if Supabase is configured
  const supabaseDbUrl = configService.get<string>('SUPABASE_DB_URL');
  const useSupabase = configService.get('USE_SUPABASE') === 'true';

  // Use Supabase if configured
  if (useSupabase && supabaseDbUrl) {
    return {
      type: 'postgres',
      url: supabaseDbUrl,
      entities,
      synchronize: configService.get('NODE_ENV') === 'development',
      logging: configService.get('NODE_ENV') === 'development',
      ssl: {
        rejectUnauthorized: false,
      },
      migrations: ['dist/migrations/*.js'],
      migrationsRun: false,
      cache: false,
    };
  }

  // Fall back to regular PostgreSQL
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USER', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_NAME', 'norchain_explorer'),
    entities,
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('DB_SSL') ? { rejectUnauthorized: false } : false,
    migrations: ['dist/migrations/*.js'],
    migrationsRun: false,
    cache: false,
  };
};
