/**
 * Enable Real-time for Supabase Tables
 * 
 * This script enables real-time replication for tables that need it
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

const tablesToEnable = [
  'blocks',
  'transactions',
  'token_transfers',
  'notifications',
];

const realtimeSQL = `
-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS token_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS notifications;
`;

async function enableRealtime() {
  try {
    console.log('📡 Enabling real-time for Supabase tables...\n');

    // Note: This requires service role key and direct database access
    // For now, we'll provide instructions
    console.log('⚠️  Real-time setup requires direct database access.');
    console.log('📋 To enable real-time:');
    console.log('   1. Go to Supabase Dashboard → Database → Replication');
    console.log('   2. Enable replication for the following tables:');
    tablesToEnable.forEach(table => console.log(`      - ${table}`));
    console.log('\n   OR run this SQL in SQL Editor:');
    console.log(realtimeSQL);
    console.log('\n✅ After enabling, verify in Dashboard → Database → Replication');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual setup:');
    console.log('   1. Go to Supabase Dashboard → Database → Replication');
    console.log('   2. Enable replication for: blocks, transactions, token_transfers, notifications');
  }
}

enableRealtime();

