# Database Migrations for New Modules

## 📋 Migration SQL Scripts

This document contains SQL migration scripts for the three new modules: Ledger, Payments (v2), and Messaging.

---

## 1. Ledger Module Migrations

### Create Ledger Accounts Table
```sql
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

CREATE INDEX idx_ledger_accounts_org_status ON ledger_accounts(org_id, status);
CREATE INDEX idx_ledger_accounts_parent ON ledger_accounts(parent_id);
```

### Create Journal Entries Table
```sql
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

CREATE INDEX idx_journal_entries_org_period ON journal_entries(org_id, period);
CREATE INDEX idx_journal_entries_tx_hash ON journal_entries(tx_hash);
CREATE INDEX idx_journal_entries_block_no ON journal_entries(block_no);
```

### Create Journal Lines Table
```sql
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

CREATE INDEX idx_journal_lines_entry ON journal_lines(entry_id);
CREATE INDEX idx_journal_lines_account ON journal_lines(account_id);
```

### Create Period Closures Table
```sql
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

CREATE INDEX idx_period_closures_merkle ON period_closures(merkle_root);
```

---

## 2. Payments Module Migrations (v2)

### Create Merchants Table
```sql
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

CREATE INDEX idx_merchants_org ON merchants(org_id);
```

### Create Checkout Sessions Table
```sql
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

CREATE INDEX idx_checkout_sessions_merchant ON checkout_sessions(merchant_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX idx_checkout_sessions_session_id ON checkout_sessions(session_id);
```

### Create Payments Table
```sql
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

CREATE INDEX idx_payments_merchant ON payments(merchant_id);
CREATE INDEX idx_payments_checkout_session ON payments(checkout_session_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash);
```

### Create Refunds Table
```sql
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

CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_merchant ON refunds(merchant_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_tx_hash ON refunds(tx_hash);
```

---

## 3. Messaging Module Migrations

### Create Messaging Profiles Table
```sql
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

CREATE INDEX idx_messaging_profiles_did ON messaging_profiles(did);
CREATE INDEX idx_messaging_profiles_address ON messaging_profiles(address);
```

### Create Conversations Table
```sql
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

CREATE INDEX idx_conversations_kind ON conversations(kind);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
```

### Create Messages Table
```sql
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

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_did);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
```

### Create Device Keys Table
```sql
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

CREATE INDEX idx_device_keys_did ON device_keys(did);
```

---

## 4. Row Level Security (RLS) Policies (Supabase)

### Ledger Accounts RLS
```sql
ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accounts for their org"
  ON ledger_accounts FOR SELECT
  USING (org_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "Users can create accounts for their org"
  ON ledger_accounts FOR INSERT
  WITH CHECK (org_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "Users can update accounts for their org"
  ON ledger_accounts FOR UPDATE
  USING (org_id = current_setting('app.current_org_id', TRUE)::UUID);
```

### Journal Entries RLS
```sql
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entries for their org"
  ON journal_entries FOR SELECT
  USING (org_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "Users can create entries for their org"
  ON journal_entries FOR INSERT
  WITH CHECK (org_id = current_setting('app.current_org_id', TRUE)::UUID);
```

### Payments RLS
```sql
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their payments"
  ON payments FOR SELECT
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE org_id = current_setting('app.current_org_id', TRUE)::UUID
    )
  );
```

### Messages RLS
```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE current_setting('app.current_did', TRUE) = ANY(members::text[])
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_did = current_setting('app.current_did', TRUE) AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE current_setting('app.current_did', TRUE) = ANY(members::text[])
    )
  );
```

---

## 5. Migration Execution

### Using TypeORM CLI
```bash
# Generate migration
npm run migration:generate -- -n AddLedgerPaymentsMessagingModules

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```

### Using Supabase SQL Editor
1. Copy each SQL block above
2. Execute in Supabase SQL Editor
3. Verify tables are created
4. Enable RLS policies

---

## 6. Verification Queries

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ledger_accounts', 'journal_entries', 'journal_lines', 'period_closures',
  'merchants', 'checkout_sessions', 'payments', 'refunds',
  'messaging_profiles', 'conversations', 'messages', 'device_keys'
);

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN (
  'ledger_accounts', 'journal_entries', 'journal_lines', 'period_closures',
  'merchants', 'checkout_sessions', 'payments', 'refunds',
  'messaging_profiles', 'conversations', 'messages', 'device_keys'
);
```

---

**Status**: ✅ Migration scripts ready for execution

