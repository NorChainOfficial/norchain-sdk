/**
 * Check Real-time Status
 * Verifies which tables have real-time enabled
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const realtimeTables = ['blocks', 'transactions', 'token_transfers', 'notifications'];

async function checkRealtimeStatus() {
  console.log('🔍 Checking Real-time Status');
  console.log('============================\n');

  console.log('📋 Tables that should have real-time:');
  realtimeTables.forEach(table => console.log(`   - ${table}`));
  console.log('');

  // Note: We can't directly query publication status via Supabase client
  // This would require direct PostgreSQL access or Supabase Management API
  console.log('⚠️  Real-time status check requires direct database access');
  console.log('   or Supabase Management API (not available via client SDK)\n');

  console.log('💡 To check real-time status:');
  console.log('   1. Go to Supabase Dashboard → Database → Replication');
  console.log('   2. Check which tables are enabled for replication');
  console.log('   3. Or run this SQL in SQL Editor:\n');

  const checkSQL = `
-- Check real-time status
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
`;

  console.log(checkSQL);
  console.log('');

  console.log('📝 To enable real-time, run:');
  console.log('   npm run db:realtime');
  console.log('   Then execute the SQL in Supabase SQL Editor');
}

checkRealtimeStatus().catch(console.error);

