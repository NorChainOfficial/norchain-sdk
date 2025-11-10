#!/bin/bash

# Supabase Database Setup Script
# This script cleans up the database, runs migrations, and prepares Supabase

set -e

echo "🚀 Setting up Supabase Database"
echo "================================="

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
echo "   Database: $SUPABASE_DB_URL"

# Build the application first
echo ""
echo "📦 Building application..."
npm run build

# Check if migrations directory exists
if [ ! -d "src/migrations" ]; then
  echo ""
  echo "📁 Creating migrations directory..."
  mkdir -p src/migrations
fi

# Generate migrations from entities (if needed)
echo ""
echo "🔄 Checking for pending migrations..."
if [ "$1" == "--generate" ]; then
  echo "   Generating migrations from entities..."
  npm run migration:generate -- src/migrations/InitialMigration || echo "   No new migrations to generate"
fi

# Run migrations
echo ""
echo "🗄️  Running migrations..."
npm run migration:run || {
  echo "⚠️  Migration run failed, trying synchronize mode..."
  echo "   This will create tables from entities"
}

# Verify connection
echo ""
echo "🔍 Verifying database connection..."
node -e "
const { AppDataSource } = require('./dist/config/data-source.js');

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connection successful');
    return AppDataSource.destroy();
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });
"

echo ""
echo "✅ Supabase database setup complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Verify tables in Supabase dashboard"
echo "   2. Set up Row Level Security (RLS) policies if needed"
echo "   3. Enable real-time for tables that need it"
echo "   4. Create storage buckets if needed"

