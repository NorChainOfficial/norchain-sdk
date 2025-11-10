/**
 * Enable Supabase Real-time for Tables
 * This script enables real-time subscriptions for important tables
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tables that should have real-time enabled
const realtimeTables = [
  'blocks',
  'transactions',
  'token_transfers',
  'notifications',
];

async function enableRealtime() {
  console.log('🚀 Enabling Supabase Real-time');
  console.log('==============================\n');

  console.log('📋 Tables to enable real-time:');
  realtimeTables.forEach(table => console.log(`   - ${table}`));

  console.log('\n⚠️  Note: Real-time must be enabled via Supabase Dashboard');
  console.log('   This script generates SQL to enable real-time\n');

  const sql = `
-- Enable Real-time for NorChain API Tables
-- Run this in Supabase SQL Editor

-- Enable real-time for blocks
ALTER PUBLICATION supabase_realtime ADD TABLE blocks;

-- Enable real-time for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Enable real-time for token_transfers
ALTER PUBLICATION supabase_realtime ADD TABLE token_transfers;

-- Enable real-time for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Verify real-time is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
`;

  console.log('📝 SQL to enable real-time:');
  console.log('─'.repeat(50));
  console.log(sql);
  console.log('─'.repeat(50));

  console.log('\n✅ SQL generated!');
  console.log('\n📋 Steps to enable real-time:');
  console.log('   1. Go to Supabase Dashboard → Database → Replication');
  console.log('   2. Or run the SQL above in SQL Editor');
  console.log('   3. Verify tables appear in Replication settings');
}

enableRealtime().catch(console.error);

