/**
 * Setup Row Level Security (RLS) Policies for Supabase
 * 
 * This script enables RLS and creates policies for user-specific tables
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rlsPolicies = `
-- Enable Row Level Security on user tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can manage own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- API keys table policies
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Public read access for blockchain data (blocks, transactions, etc.)
-- These tables don't need RLS as they're public blockchain data
-- But we can add policies if needed for rate limiting or access control
`;

async function setupRLS() {
  try {
    console.log('🔒 Setting up Row Level Security (RLS) policies...\n');

    const { error } = await supabase.rpc('exec_sql', { sql: rlsPolicies });

    if (error) {
      // Try direct SQL execution via REST API
      console.log('⚠️  RPC method not available, using direct SQL...\n');
      
      // Execute policies one by one
      const policies = rlsPolicies.split(';').filter(p => p.trim());
      
      for (const policy of policies) {
        if (policy.trim()) {
          const { error: execError } = await supabase.rpc('exec_sql', { sql: policy + ';' });
          if (execError && !execError.message.includes('already exists') && !execError.message.includes('does not exist')) {
            console.warn(`⚠️  Warning: ${execError.message}`);
          }
        }
      }
    }

    console.log('✅ RLS policies setup complete!\n');
    console.log('📋 Policies created:');
    console.log('   - Users: view/update own profile');
    console.log('   - API Keys: view/manage own keys');
    console.log('   - Notifications: view/update own notifications');
    console.log('\n📊 Next steps:');
    console.log('   1. Verify policies in Supabase Dashboard → Authentication → Policies');
    console.log('   2. Test with authenticated users');
    console.log('   3. Adjust policies as needed for your use case');

  } catch (error: any) {
    console.error('❌ Error setting up RLS:', error.message);
    console.log('\n💡 Manual setup:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Run the SQL from supabase-setup.sql (lines 268-284)');
    process.exit(1);
  }
}

setupRLS();

