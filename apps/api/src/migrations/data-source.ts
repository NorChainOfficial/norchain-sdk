import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

// Import all entities
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
import { MessageReaction } from '../modules/messaging/entities/reaction.entity';

const supabaseDbUrl = process.env.SUPABASE_DB_URL;
const useSupabase = process.env.USE_SUPABASE === 'true';

export const MigrationDataSource = new DataSource({
  type: 'postgres',
  url: useSupabase && supabaseDbUrl ? supabaseDbUrl : undefined,
  host: !useSupabase ? process.env.DB_HOST || 'localhost' : undefined,
  port: !useSupabase ? parseInt(process.env.DB_PORT || '5432') : undefined,
  username: !useSupabase ? process.env.DB_USER || 'postgres' : undefined,
  password: !useSupabase ? process.env.DB_PASSWORD || 'postgres' : undefined,
  database: !useSupabase
    ? process.env.DB_NAME || 'norchain_explorer'
    : undefined,
  entities: [
    LedgerAccount,
    JournalEntry,
    JournalLine,
    PeriodClosure,
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
    MessagingProfile,
    Conversation,
    Message,
    DeviceKey,
    MessageReaction,
  ],
  migrations: [
    path.join(__dirname, '1738000000000-AddLedgerPaymentsMessagingModules.ts'),
  ],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  ssl:
    useSupabase && supabaseDbUrl
      ? { rejectUnauthorized: false }
      : process.env.DB_SSL
        ? { rejectUnauthorized: false }
        : false,
});

