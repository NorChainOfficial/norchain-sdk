#!/bin/bash

# Database Migration Execution Script
# This script executes the migration SQL script

set -e

echo "🚀 Executing Database Migration"
echo "================================"
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Supabase is configured
if [ -z "$SUPABASE_DB_URL" ] || [ "$USE_SUPABASE" != "true" ]; then
  echo "❌ Error: Supabase is not configured"
  echo "   Please set USE_SUPABASE=true and SUPABASE_DB_URL in .env"
  echo ""
  echo "📝 Alternative: Use SQL script from docs/MIGRATION_SQL.md"
  echo "   Copy and paste into Supabase SQL Editor"
  exit 1
fi

echo "✅ Supabase configuration found"
echo "   Database URL: ${SUPABASE_DB_URL:0:30}..."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "⚠️  psql not found"
  echo ""
  echo "📝 Please execute migration manually:"
  echo "   1. Open Supabase Dashboard → SQL Editor"
  echo "   2. Copy SQL from docs/MIGRATION_SQL.md"
  echo "   3. Execute the script"
  echo ""
  exit 1
fi

echo "📦 Executing migration SQL..."
echo ""

# Extract SQL from migration file
SQL_FILE="docs/MIGRATION_SQL.md"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Error: Migration SQL file not found: $SQL_FILE"
  exit 1
fi

# Extract SQL block (between ```sql and ```)
SQL_CONTENT=$(sed -n '/```sql/,/```/p' "$SQL_FILE" | sed '/```sql/d; /```/d')

if [ -z "$SQL_CONTENT" ]; then
  echo "❌ Error: Could not extract SQL from $SQL_FILE"
  exit 1
fi

# Execute SQL
echo "$SQL_CONTENT" | psql "$SUPABASE_DB_URL" || {
  echo ""
  echo "⚠️  Migration execution failed"
  echo ""
  echo "📝 Alternative: Execute SQL manually in Supabase SQL Editor"
  echo "   File: docs/MIGRATION_SQL.md"
  exit 1
}

echo ""
echo "✅ Migration executed successfully!"
echo ""
echo "🔍 Verifying tables..."
VERIFY_SQL="SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ledger_accounts', 'journal_entries', 'journal_lines', 'period_closures',
  'merchants', 'products', 'prices', 'customers', 'payment_methods',
  'checkout_sessions', 'payments', 'refunds', 'subscriptions', 'disputes',
  'webhook_endpoints', 'messaging_profiles', 'conversations', 'messages',
  'device_keys', 'message_reactions'
);"

TABLE_COUNT=$(echo "$VERIFY_SQL" | psql "$SUPABASE_DB_URL" -t -A)

if [ "$TABLE_COUNT" -eq 20 ]; then
  echo "✅ All 20 tables created successfully!"
else
  echo "⚠️  Expected 20 tables, found $TABLE_COUNT"
fi

echo ""
echo "✅ Migration complete!"

