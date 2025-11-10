/**
 * Direct Supabase Test
 * Tests Supabase services without TypeORM dependency
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function testSupabase() {
  console.log('🧪 Testing Supabase Direct Connection');
  console.log('====================================\n');

  const results = {
    connection: false,
    auth: false,
    storage: false,
    realtime: false,
    tables: [] as string[],
  };

  // Test 1: Connection
  console.log('1️⃣  Testing connection...');
  try {
    const { data, error } = await supabase.from('blocks').select('count').limit(1);
    if (!error || error.code === 'PGRST116') {
      results.connection = true;
      console.log('   ✅ Connection successful\n');
    } else {
      console.log(`   ⚠️  Connection test: ${error.message}\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Connection test: ${error.message}\n`);
  }

  // Test 2: Check tables
  console.log('2️⃣  Checking database tables...');
  const expectedTables = [
    'blocks',
    'transactions',
    'users',
    'notifications',
    'api_keys',
  ];

  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        results.tables.push(table);
        console.log(`   ✅ ${table}`);
      } else if (error.code === 'PGRST116') {
        console.log(`   ❌ ${table} - Table not found`);
      } else {
        console.log(`   ⚠️  ${table} - ${error.message}`);
      }
    } catch (error: any) {
      console.log(`   ⚠️  ${table} - ${error.message}`);
    }
  }
  console.log('');

  // Test 3: Auth Service
  console.log('3️⃣  Testing Auth Service...');
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('   ✅ Auth service working (user exists)');
        results.auth = true;
      } else {
        console.log(`   ⚠️  Sign up: ${signUpError.message}`);
      }
    } else {
      console.log('   ✅ Auth service working (user created)');
      results.auth = true;
    }
  } catch (error: any) {
    console.log(`   ⚠️  Auth test: ${error.message}`);
  }
  console.log('');

  // Test 4: Storage Service
  console.log('4️⃣  Testing Storage Service...');
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (!bucketsError) {
      console.log(`   ✅ Storage service working (${buckets?.length || 0} buckets)`);
      results.storage = true;
    } else {
      console.log(`   ⚠️  Storage: ${bucketsError.message}`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Storage test: ${error.message}`);
  }
  console.log('');

  // Test 5: Real-time
  console.log('5️⃣  Testing Real-time...');
  try {
    const channel = supabase.channel('test-channel');
    await channel.subscribe();
    // If subscribe doesn't throw, real-time is working
    console.log('   ✅ Real-time service working');
    results.realtime = true;
    await supabase.removeChannel(channel);
  } catch (error: any) {
    console.log(`   ⚠️  Real-time test: ${error.message}`);
  }
  console.log('');

  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`✅ Connection: ${results.connection ? 'Working' : 'Failed'}`);
  console.log(`✅ Auth: ${results.auth ? 'Working' : 'Failed'}`);
  console.log(`✅ Storage: ${results.storage ? 'Working' : 'Failed'}`);
  console.log(`✅ Real-time: ${results.realtime ? 'Working' : 'Failed'}`);
  console.log(`✅ Tables found: ${results.tables.length}/${expectedTables.length}`);
  console.log('');

  if (results.connection && results.auth && results.storage && results.realtime) {
    console.log('🎉 All Supabase services are working!');
    return 0;
  } else {
    console.log('⚠️  Some services need attention');
    return 1;
  }
}

testSupabase()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

