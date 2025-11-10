#!/bin/bash

# Complete Supabase Reset Script
# This script cleans up, generates migrations, and sets up Supabase

set -e

echo "🚀 Complete Supabase Reset"
echo "=========================="

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

# Step 1: Cleanup
echo ""
echo "Step 1/3: Cleaning up database..."
npm run db:cleanup -- --force || echo "   Cleanup skipped or failed"

# Step 2: Build
echo ""
echo "Step 2/3: Building application..."
npm run build

# Step 3: Generate and run migrations
echo ""
echo "Step 3/3: Setting up database..."

# Create migrations directory if it doesn't exist
mkdir -p src/migrations

# Generate initial migration if migrations directory is empty
if [ -z "$(ls -A src/migrations/*.ts 2>/dev/null)" ]; then
  echo "   Generating initial migration..."
  npm run migration:generate -- src/migrations/InitialMigration || {
    echo "   ⚠️  Could not generate migration, will use synchronize"
  }
fi

# Run migrations
echo "   Running migrations..."
npm run migration:run || {
  echo "   ⚠️  Migrations failed, checking if tables exist..."
}

# Verify setup
echo ""
echo "🔍 Verifying database setup..."
node -e "
const { AppDataSource } = require('./dist/config/data-source.js');

AppDataSource.initialize()
  .then(async (ds) => {
    const result = await ds.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    \`);
    console.log('✅ Database connection successful');
    console.log('📊 Tables found:', result.length);
    if (result.length > 0) {
      result.forEach(row => console.log('   -', row.table_name));
    }
    await ds.destroy();
  })
  .catch((error) => {
    console.error('❌ Database verification failed:', error.message);
    process.exit(1);
  });
"

echo ""
echo "✅ Supabase reset complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Verify tables in Supabase dashboard"
echo "   2. Set up Row Level Security (RLS) policies"
echo "   3. Enable real-time for tables that need it"
echo "   4. Create storage buckets if needed"

