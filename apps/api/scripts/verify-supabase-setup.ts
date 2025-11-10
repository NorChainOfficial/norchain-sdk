/**
 * Verify Supabase Database Setup
 * Checks if tables exist and provides setup status
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const expectedTables = [
  'blocks',
  'transactions',
  'transaction_logs',
  'token_transfers',
  'nft_transfers',
  'token_holders',
  'token_metadata',
  'contracts',
  'users',
  'api_keys',
  'notifications',
  'api_usage',
  'limit_orders',
  'dca_schedules',
  'stop_loss_orders',
  'migrations',
];

async function verifySetup() {
  console.log('🔍 Verifying Supabase Database Setup');
  console.log('====================================\n');

  try {
    // Get all tables
    const { data: tables, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `,
    });

    if (error) {
      // Try alternative method - query each table
      console.log('📊 Checking tables individually...\n');
      
      const foundTables: string[] = [];
      const missingTables: string[] = [];

      for (const table of expectedTables) {
        try {
          const { error: tableError } = await supabase.from(table).select('*').limit(1);
          if (!tableError || tableError.code === 'PGRST116') {
            // Table exists or doesn't exist (PGRST116)
            if (!tableError) {
              foundTables.push(table);
              console.log(`✅ ${table}`);
            } else {
              missingTables.push(table);
              console.log(`❌ ${table} - Missing`);
            }
          } else {
            foundTables.push(table);
            console.log(`✅ ${table}`);
          }
        } catch (e: any) {
          if (e.message?.includes('does not exist') || e.code === 'PGRST116') {
            missingTables.push(table);
            console.log(`❌ ${table} - Missing`);
          } else {
            foundTables.push(table);
            console.log(`✅ ${table}`);
          }
        }
      }

      console.log('\n📊 Summary:');
      console.log(`   ✅ Found: ${foundTables.length}/${expectedTables.length} tables`);
      console.log(`   ❌ Missing: ${missingTables.length} tables`);

      if (missingTables.length > 0) {
        console.log('\n⚠️  Missing tables:');
        missingTables.forEach(table => console.log(`   - ${table}`));
        console.log('\n💡 To create missing tables:');
        console.log('   1. Run: npm run db:setup:sql');
        console.log('   2. Or execute supabase-setup.sql in Supabase SQL Editor');
      } else {
        console.log('\n✅ All tables are present!');
        console.log('\n📋 Next steps:');
        console.log('   1. Enable real-time for: blocks, transactions, token_transfers, notifications');
        console.log('   2. Review RLS policies');
        console.log('   3. Create storage buckets if needed');
      }
    } else {
      const tableNames = tables?.map((t: any) => t.table_name) || [];
      console.log(`📊 Found ${tableNames.length} tables:\n`);
      tableNames.forEach((name: string) => {
        const isExpected = expectedTables.includes(name);
        console.log(`${isExpected ? '✅' : '⚠️ '} ${name}${isExpected ? '' : ' (unexpected)'}`);
      });

      const missing = expectedTables.filter(t => !tableNames.includes(t));
      if (missing.length > 0) {
        console.log(`\n❌ Missing tables: ${missing.join(', ')}`);
      } else {
        console.log('\n✅ All expected tables are present!');
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Check tables manually in Supabase Dashboard');
  }
}

verifySetup().catch(console.error);

