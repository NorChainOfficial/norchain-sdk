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
import { LimitOrder } from '../modules/orders/entities/limit-order.entity';
import { DCASchedule } from '../modules/orders/entities/dca-schedule.entity';
import { StopLossOrder } from '../modules/orders/entities/stop-loss-order.entity';
import { Wallet } from '../modules/wallet/entities/wallet.entity';
import { BridgeTransfer } from '../modules/bridge/entities/bridge-transfer.entity';
import { ComplianceScreening } from '../modules/compliance/entities/compliance-screening.entity';
import { ComplianceCase } from '../modules/compliance/entities/compliance-case.entity';
import { GovernanceProposal } from '../modules/governance/entities/governance-proposal.entity';
import { GovernanceVote } from '../modules/governance/entities/governance-vote.entity';
import { PaymentInvoice } from '../modules/payments/entities/payment-invoice.entity';
import { POSSession } from '../modules/payments/entities/pos-session.entity';
import { MerchantSettlement } from '../modules/payments/entities/merchant-settlement.entity';
import { Validator } from '../modules/admin/entities/validator.entity';
import { SlashingEvent } from '../modules/admin/entities/slashing-event.entity';
import { FeatureFlag } from '../modules/admin/entities/feature-flag.entity';
import { AuditLog } from '../modules/admin/entities/audit-log.entity';
import { WebhookSubscription } from '../modules/webhooks/entities/webhook-subscription.entity';
import { WebhookDelivery } from '../modules/webhooks/entities/webhook-delivery.entity';
import { PolicyCheck } from '../modules/policy/entities/policy-check.entity';
import { AssetProfile } from '../modules/metadata/entities/asset-profile.entity';
import { AssetProfileVersion } from '../modules/metadata/entities/asset-profile-version.entity';
import { OwnershipChallenge } from '../modules/metadata/entities/ownership-challenge.entity';
import { CommunityAttestation } from '../modules/metadata/entities/community-attestation.entity';
import { AssetReport } from '../modules/metadata/entities/asset-report.entity';

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
    LimitOrder,
    DCASchedule,
    StopLossOrder,
    Wallet,
    BridgeTransfer,
    ComplianceScreening,
    ComplianceCase,
    GovernanceProposal,
    GovernanceVote,
    PaymentInvoice,
    POSSession,
    MerchantSettlement,
    Validator,
    SlashingEvent,
    FeatureFlag,
    AuditLog,
    WebhookSubscription,
    WebhookDelivery,
    PolicyCheck,
    AssetProfile,
    AssetProfileVersion,
    OwnershipChallenge,
    CommunityAttestation,
    AssetReport,
  ];

  // Check if Supabase is configured
  const supabaseDbUrl = configService.get<string>('SUPABASE_DB_URL');
  const useSupabase = configService.get('USE_SUPABASE') === 'true';

  const nodeEnv = configService.get('NODE_ENV', 'development');
  const isTest = nodeEnv === 'test';

  // Use Supabase if configured
  if (useSupabase && supabaseDbUrl) {
    return {
      type: 'postgres',
      url: supabaseDbUrl,
      entities,
      autoLoadEntities: false,
      synchronize: !isTest && nodeEnv === 'development',
      logging: !isTest && nodeEnv === 'development',
      ssl: {
        rejectUnauthorized: false,
      },
      migrations: isTest ? [] : [],
      migrationsRun: false,
      cache: false,
      dropSchema: false,
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
    autoLoadEntities: false,
    synchronize: !isTest && nodeEnv === 'development',
    logging: !isTest && nodeEnv === 'development',
    ssl: configService.get('DB_SSL') ? { rejectUnauthorized: false } : false,
    migrations: isTest ? [] : ['dist/migrations/*.js'],
    migrationsRun: false,
    cache: false,
    dropSchema: false,
  };
};
