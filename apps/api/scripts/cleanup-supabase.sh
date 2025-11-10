#!/bin/bash

# Supabase Database Cleanup Script
# This script drops all tables and prepares for fresh migration

set -e

echo "🧹 Cleaning up Supabase Database"
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

echo "⚠️  WARNING: This will drop all tables in the database!"

# Check for --force flag to skip confirmation
if [ "$1" != "--force" ]; then
  read -p "   Are you sure you want to continue? (yes/no): " confirm

  if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
  fi
else
  echo "   --force flag detected, proceeding without confirmation"
fi

# Build the application first
echo ""
echo "📦 Building application..."
npm run build

# Extract database connection details from URL
# Format: postgresql://user:password@host:port/database
DB_URL=$SUPABASE_DB_URL

echo ""
echo "🗑️  Dropping all tables..."

# Use psql to drop all tables
node -e "
const { Client } = require('pg');
const url = require('url');

const dbUrl = process.env.SUPABASE_DB_URL;
const parsed = url.parse(dbUrl);

const client = new Client({
  host: parsed.hostname,
  port: parsed.port || 5432,
  database: parsed.pathname?.slice(1) || 'postgres',
  user: parsed.auth?.split(':')[0],
  password: parsed.auth?.split(':')[1],
  ssl: { rejectUnauthorized: false }
});

async function cleanup() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Drop all tables
    const result = await client.query(\`
      DO \$\$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END \$\$;
    \`);
    
    console.log('✅ All tables dropped');
    
    // Drop migrations table if exists
    await client.query('DROP TABLE IF EXISTS migrations CASCADE');
    console.log('✅ Migrations table dropped');
    
    await client.end();
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
"

echo ""
echo "✅ Database cleanup complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Run: npm run db:setup"
echo "   2. This will create tables and run migrations"

