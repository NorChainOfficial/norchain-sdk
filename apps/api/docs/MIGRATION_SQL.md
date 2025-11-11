# Database Migration SQL Script

## Migration: AddLedgerPaymentsMessagingModules

**Date**: January 2025  
**File**: `1738000000000-AddLedgerPaymentsMessagingModules.ts`

---

## 🚀 Execution Options

### Option 1: Supabase SQL Editor (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the SQL below
3. Execute the script
4. Verify tables created

### Option 2: psql Command Line
```bash
psql $SUPABASE_DB_URL -f migration.sql
```

### Option 3: TypeORM CLI (if configured)
```bash
npm run migration:run
```

---

## 📋 SQL Script

```sql
-- ============================================
-- LEDGER MODULE TABLES
-- ============================================

-- Ledger Accounts
CREATE TABLE IF NOT EXISTS ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  currency VARCHAR(10) NOT NULL DEFAULT 'NOR',
  org_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  parent_id UUID REFERENCES ledger_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, code)
);

CREATE INDEX IF NOT EXISTS idx_ledger_accounts_org_status ON ledger_accounts(org_id, status);
CREATE INDEX IF NOT EXISTS idx_ledger_accounts_parent ON ledger_accounts(parent_id);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  tx_hash VARCHAR(66),
  block_no BIGINT,
  occurred_at TIMESTAMPTZ NOT NULL,
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period VARCHAR(20) NOT NULL,
  memo TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, event_type, event_id)
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_org_period ON journal_entries(org_id, period);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tx_hash ON journal_entries(tx_hash);
CREATE INDEX IF NOT EXISTS idx_journal_entries_block_no ON journal_entries(block_no);

-- Journal Lines
CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES ledger_accounts(id),
  currency VARCHAR(10) NOT NULL DEFAULT 'NOR',
  amount DECIMAL(36, 18) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('debit', 'credit')),
  fx_rate DECIMAL(18, 8),
  amount_native DECIMAL(36, 18) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);

-- Period Closures
CREATE TABLE IF NOT EXISTS period_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period VARCHAR(20) NOT NULL,
  org_id UUID NOT NULL,
  locked_by UUID NOT NULL,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  merkle_root VARCHAR(66) NOT NULL,
  anchor_tx VARCHAR(66),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, period)
);

CREATE INDEX IF NOT EXISTS idx_period_closures_merkle ON period_closures(merkle_root);

-- ============================================
-- PAYMENTS V2 MODULE TABLES
-- ============================================

-- Merchants
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE,
  kyc_tier VARCHAR(20) NOT NULL DEFAULT 'tier_0' CHECK (kyc_tier IN ('tier_0', 'tier_1', 'tier_2', 'tier_3')),
  settlement_prefs VARCHAR(20) NOT NULL DEFAULT 'crypto_only' CHECK (settlement_prefs IN ('crypto_only', 'crypto_and_fiat')),
  webhook_secret VARCHAR(255),
  webhook_url VARCHAR(500),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_org ON merchants(org_id);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_org ON products(org_id);

-- Prices
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount DECIMAL(36, 18) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'NOR',
  billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('one_time', 'monthly', 'yearly', 'weekly', 'daily')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_active ON prices(active);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  address VARCHAR(42),
  email VARCHAR(255),
  kyc_tier VARCHAR(20) NOT NULL DEFAULT 'tier_0' CHECK (kyc_tier IN ('tier_0', 'tier_1', 'tier_2', 'tier_3')),
  display_name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(org_id);
CREATE INDEX IF NOT EXISTS idx_customers_address ON customers(address);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('custodial', 'external', 'bank')),
  details_enc TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_customer ON payment_methods(customer_id);

-- Checkout Sessions
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL UNIQUE,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  amount DECIMAL(36, 18) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'NOR',
  assets JSONB,
  metadata JSONB,
  success_url VARCHAR(500),
  cancel_url VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
  payment_tx_hash VARCHAR(66),
  payer_address VARCHAR(42),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkout_sessions_merchant ON checkout_sessions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_session_id ON checkout_sessions(session_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id VARCHAR(255) NOT NULL UNIQUE,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  checkout_session_id UUID REFERENCES checkout_sessions(id),
  invoice_id UUID,
  amount DECIMAL(36, 18) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'NOR',
  payer_address VARCHAR(42) NOT NULL,
  recipient_address VARCHAR(42),
  tx_hash VARCHAR(66),
  block_no BIGINT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'succeeded', 'failed', 'refunded')),
  metadata JSONB,
  journal_entry_id UUID,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_merchant ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_session ON payments(checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);

-- Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_id VARCHAR(255) NOT NULL UNIQUE,
  payment_id UUID NOT NULL REFERENCES payments(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  amount DECIMAL(36, 18) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'NOR',
  recipient_address VARCHAR(42) NOT NULL,
  tx_hash VARCHAR(66),
  block_no BIGINT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed')),
  reason TEXT,
  metadata JSONB,
  journal_entry_id UUID,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_merchant ON refunds(merchant_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_tx_hash ON refunds(tx_hash);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'trialing' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_at TIMESTAMPTZ,
  proration_policy VARCHAR(20) NOT NULL DEFAULT 'create_proration' CHECK (proration_policy IN ('none', 'create_proration', 'always_invoice')),
  canceled_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_price ON subscriptions(price_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'won', 'lost', 'warning_closed')),
  reason TEXT NOT NULL,
  merchant_evidence JSONB,
  customer_evidence JSONB,
  escrow_tx VARCHAR(66),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_payment ON disputes(payment_id);
CREATE INDEX IF NOT EXISTS idx_disputes_merchant ON disputes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- Webhook Endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  url VARCHAR(500) NOT NULL,
  hmac_secret VARCHAR(255) NOT NULL,
  events JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_org ON webhook_endpoints(org_id);

-- ============================================
-- MESSAGING MODULE TABLES
-- ============================================

-- Messaging Profiles
CREATE TABLE IF NOT EXISTS messaging_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(42) NOT NULL,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messaging_profiles_did ON messaging_profiles(did);
CREATE INDEX IF NOT EXISTS idx_messaging_profiles_address ON messaging_profiles(address);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('p2p', 'group', 'channel')),
  created_by VARCHAR(255) NOT NULL,
  members JSONB NOT NULL,
  name VARCHAR(255),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_kind ON conversations(kind);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_did VARCHAR(255) NOT NULL,
  cipher_text TEXT NOT NULL,
  media_ref VARCHAR(500),
  delivered_to JSONB,
  read_by JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_nonce UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_did);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);

-- Device Keys
CREATE TABLE IF NOT EXISTS device_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  prekey_bundle TEXT NOT NULL,
  signed_prekey TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(did, device_id)
);

CREATE INDEX IF NOT EXISTS idx_device_keys_did ON device_keys(did);

-- Message Reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_did VARCHAR(255) NOT NULL,
  emoji VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_did, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_did);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ledger_accounts', 'journal_entries', 'journal_lines', 'period_closures',
  'merchants', 'products', 'prices', 'customers', 'payment_methods',
  'checkout_sessions', 'payments', 'refunds', 'subscriptions', 'disputes',
  'webhook_endpoints', 'messaging_profiles', 'conversations', 'messages',
  'device_keys', 'message_reactions'
)
ORDER BY table_name;
```

---

## ✅ Verification

After executing the migration, verify tables exist:

```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ledger_accounts', 'journal_entries', 'journal_lines', 'period_closures',
  'merchants', 'products', 'prices', 'customers', 'payment_methods',
  'checkout_sessions', 'payments', 'refunds', 'subscriptions', 'disputes',
  'webhook_endpoints', 'messaging_profiles', 'conversations', 'messages',
  'device_keys', 'message_reactions'
);
```

Expected result: **20 tables**

---

**Status**: ✅ **SQL Script Ready for Execution**

