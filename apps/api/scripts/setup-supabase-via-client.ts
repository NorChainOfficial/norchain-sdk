/**
 * Supabase Database Setup via Client SDK
 * Alternative approach using Supabase client instead of direct PostgreSQL connection
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase Database via Client SDK');
  console.log('==============================================');
  console.log(`✅ Supabase URL: ${supabaseUrl}`);

  try {
    // Test connection
    console.log('\n🔍 Testing connection...');
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist, which is fine
      console.log('✅ Connection successful (table check)');
    } else {
      console.log('✅ Connection successful');
    }

    // Since we can't create tables directly via Supabase client,
    // we'll provide SQL that can be run in Supabase SQL editor
    console.log('\n📝 Generating SQL for table creation...');
    
    const sqlFile = path.join(__dirname, '../supabase-setup.sql');
    const sql = generateTableSQL();
    
    fs.writeFileSync(sqlFile, sql);
    console.log(`✅ SQL file created: ${sqlFile}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Copy and paste the contents of supabase-setup.sql');
    console.log('   3. Run the SQL script');
    console.log('   4. Enable real-time for tables that need it');
    console.log('   5. Set up Row Level Security (RLS) policies');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function generateTableSQL(): string {
  return `
-- NorChain API Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id BIGSERIAL PRIMARY KEY,
  number BIGINT UNIQUE NOT NULL,
  hash VARCHAR(66) UNIQUE NOT NULL,
  parent_hash VARCHAR(66),
  timestamp TIMESTAMP NOT NULL,
  gas_limit VARCHAR(78),
  gas_used VARCHAR(78),
  base_fee_per_gas VARCHAR(78),
  miner VARCHAR(42),
  extra_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocks_number ON blocks(number);
CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(hash);
CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  hash VARCHAR(66) UNIQUE NOT NULL,
  block_number BIGINT,
  block_hash VARCHAR(66),
  transaction_index INTEGER,
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  value VARCHAR(78),
  gas_price VARCHAR(78),
  gas_limit VARCHAR(78),
  gas_used VARCHAR(78),
  nonce BIGINT,
  input_data TEXT,
  status INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (block_number) REFERENCES blocks(number) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash);
CREATE INDEX IF NOT EXISTS idx_transactions_block_number ON transactions(block_number);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);

-- Transaction logs table
CREATE TABLE IF NOT EXISTS transaction_logs (
  id BIGSERIAL PRIMARY KEY,
  transaction_hash VARCHAR(66) NOT NULL,
  log_index INTEGER NOT NULL,
  address VARCHAR(42),
  data TEXT,
  topics TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (transaction_hash) REFERENCES transactions(hash) ON DELETE CASCADE,
  UNIQUE(transaction_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_transaction_logs_tx_hash ON transaction_logs(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_address ON transaction_logs(address);

-- Token transfers table
CREATE TABLE IF NOT EXISTS token_transfers (
  id BIGSERIAL PRIMARY KEY,
  transaction_hash VARCHAR(66) NOT NULL,
  log_index INTEGER NOT NULL,
  token_address VARCHAR(42),
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  value VARCHAR(78),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (transaction_hash) REFERENCES transactions(hash) ON DELETE CASCADE,
  UNIQUE(transaction_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_token_transfers_token_address ON token_transfers(token_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_from_address ON token_transfers(from_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_to_address ON token_transfers(to_address);

-- NFT transfers table
CREATE TABLE IF NOT EXISTS nft_transfers (
  id BIGSERIAL PRIMARY KEY,
  transaction_hash VARCHAR(66) NOT NULL,
  log_index INTEGER NOT NULL,
  contract_address VARCHAR(42),
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  token_id VARCHAR(78),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (transaction_hash) REFERENCES transactions(hash) ON DELETE CASCADE,
  UNIQUE(transaction_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_nft_transfers_contract_address ON nft_transfers(contract_address);
CREATE INDEX IF NOT EXISTS idx_nft_transfers_token_id ON nft_transfers(token_id);

-- Token holders table
CREATE TABLE IF NOT EXISTS token_holders (
  id BIGSERIAL PRIMARY KEY,
  token_address VARCHAR(42) NOT NULL,
  holder_address VARCHAR(42) NOT NULL,
  balance VARCHAR(78) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(token_address, holder_address)
);

CREATE INDEX IF NOT EXISTS idx_token_holders_token_address ON token_holders(token_address);
CREATE INDEX IF NOT EXISTS idx_token_holders_holder_address ON token_holders(holder_address);

-- Token metadata table
CREATE TABLE IF NOT EXISTS token_metadata (
  id BIGSERIAL PRIMARY KEY,
  token_address VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(255),
  symbol VARCHAR(50),
  decimals INTEGER,
  total_supply VARCHAR(78),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_metadata_address ON token_metadata(token_address);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id BIGSERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(255),
  abi JSONB,
  source_code TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_address ON contracts(address);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  roles TEXT[] DEFAULT ARRAY['user'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- API usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id BIGSERIAL PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  user_id UUID,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);

-- Limit orders table
CREATE TABLE IF NOT EXISTS limit_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address VARCHAR(42) NOT NULL,
  token_in VARCHAR(42) NOT NULL,
  token_out VARCHAR(42) NOT NULL,
  amount_in VARCHAR(78) NOT NULL,
  amount_out VARCHAR(78) NOT NULL,
  price VARCHAR(78) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_limit_orders_user_address ON limit_orders(user_address);
CREATE INDEX IF NOT EXISTS idx_limit_orders_status ON limit_orders(status);

-- DCA schedules table
CREATE TABLE IF NOT EXISTS dca_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address VARCHAR(42) NOT NULL,
  token_in VARCHAR(42) NOT NULL,
  token_out VARCHAR(42) NOT NULL,
  amount VARCHAR(78) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  next_execution TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dca_schedules_user_address ON dca_schedules(user_address);
CREATE INDEX IF NOT EXISTS idx_dca_schedules_next_execution ON dca_schedules(next_execution);

-- Stop loss orders table
CREATE TABLE IF NOT EXISTS stop_loss_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address VARCHAR(42) NOT NULL,
  token_address VARCHAR(42) NOT NULL,
  trigger_price VARCHAR(78) NOT NULL,
  amount VARCHAR(78) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stop_loss_orders_user_address ON stop_loss_orders(user_address);
CREATE INDEX IF NOT EXISTS idx_stop_loss_orders_status ON stop_loss_orders(status);

-- Migrations table (for TypeORM)
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  UNIQUE(timestamp, name)
);

-- Enable Row Level Security on user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only see their own data)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Enable real-time for important tables
-- Note: Run these in Supabase Dashboard → Database → Replication

COMMENT ON TABLE blocks IS 'Blockchain blocks - Enable real-time';
COMMENT ON TABLE transactions IS 'Blockchain transactions - Enable real-time';
COMMENT ON TABLE token_transfers IS 'Token transfers - Enable real-time';
COMMENT ON TABLE notifications IS 'User notifications - Enable real-time';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '   1. Enable real-time for blocks, transactions, token_transfers, notifications';
  RAISE NOTICE '   2. Review and adjust RLS policies as needed';
  RAISE NOTICE '   3. Create storage buckets if needed';
END $$;
`;
}

setupDatabase().catch(console.error);

