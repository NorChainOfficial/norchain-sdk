#!/bin/bash

# Simple Supabase Setup Script
# Uses synchronize mode to create tables directly from entities

set -e

echo "🚀 Setting up Supabase Database (Simple Mode)"
echo "============================================="

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Supabase is configured
if [ -z "$SUPABASE_DB_URL" ] || [ "$USE_SUPABASE" != "true" ]; then
  echo "❌ Error: Supabase is not configured"
  echo "   Please set USE_SUPABASE=true and SUPABASE_DB_URL in .env"
  exit 1
fi

echo "✅ Supabase configuration found"
echo "   URL: $SUPABASE_URL"

# Build the application
echo ""
echo "📦 Building application..."
npm run build

# Create tables using synchronize
echo ""
echo "🗄️  Creating tables from entities..."
node -e "
const { AppDataSource } = require('./dist/config/data-source.js');

async function setup() {
  try {
    const ds = AppDataSource;
    
    // Temporarily enable synchronize
    ds.options.synchronize = true;
    
    await ds.initialize();
    console.log('✅ Database connection successful');
    console.log('✅ Tables created/updated from entities');
    
    // Disable synchronize for future runs
    ds.options.synchronize = false;
    
    // List all tables
    const result = await ds.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    \`);
    
    console.log('');
    console.log('📊 Tables in database:', result.length);
    result.forEach(row => console.log('   ✓', row.table_name));
    
    await ds.destroy();
    console.log('');
    console.log('✅ Setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('   Cannot resolve database hostname');
      console.error('   Please check SUPABASE_DB_URL in .env');
    }
    process.exit(1);
  }
}

setup();
"

echo ""
echo "📊 Next steps:"
echo "   1. Verify tables in Supabase dashboard"
echo "   2. Set up Row Level Security (RLS) policies"
echo "   3. Enable real-time for tables that need it"
echo "   4. Create storage buckets if needed"

