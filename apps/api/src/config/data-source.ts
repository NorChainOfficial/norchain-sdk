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
import { LedgerAccount } from '../modules/ledger/entities/ledger-account.entity';
import { JournalEntry } from '../modules/ledger/entities/journal-entry.entity';
import { JournalLine } from '../modules/ledger/entities/journal-line.entity';
import { PeriodClosure } from '../modules/ledger/entities/period-closure.entity';
import { Merchant } from '../modules/payments/entities/merchant.entity';
import { CheckoutSession } from '../modules/payments/entities/checkout-session.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { Refund } from '../modules/payments/entities/refund.entity';
import { Product } from '../modules/payments/entities/product.entity';
import { Price } from '../modules/payments/entities/price.entity';
import { Customer } from '../modules/payments/entities/customer.entity';
import { PaymentMethod } from '../modules/payments/entities/payment-method.entity';
import { Subscription } from '../modules/payments/entities/subscription.entity';
import { Dispute } from '../modules/payments/entities/dispute.entity';
import { WebhookEndpoint } from '../modules/payments/entities/webhook-endpoint.entity';
import { MessagingProfile } from '../modules/messaging/entities/profile.entity';
import { Conversation } from '../modules/messaging/entities/conversation.entity';
import { Message } from '../modules/messaging/entities/message.entity';
import { DeviceKey } from '../modules/messaging/entities/device-key.entity';

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
    // Ledger Module
    LedgerAccount,
    JournalEntry,
    JournalLine,
    PeriodClosure,
    // Payments v2 Module
    Merchant,
    CheckoutSession,
    Payment,
    Refund,
    Product,
    Price,
    Customer,
    PaymentMethod,
    Subscription,
    Dispute,
    WebhookEndpoint,
    // Messaging Module
    MessagingProfile,
    Conversation,
    Message,
    DeviceKey,
    MessageReaction,
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
