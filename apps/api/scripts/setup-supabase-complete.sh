#!/bin/bash

# Complete Supabase Setup Script
# Verifies setup and provides next steps

set -e

echo "🚀 Complete Supabase Setup Verification"
echo "========================================"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Supabase is configured
if [ -z "$SUPABASE_URL" ] || [ "$USE_SUPABASE" != "true" ]; then
  echo "❌ Error: Supabase is not configured"
  exit 1
fi

echo "✅ Supabase configuration found"
echo ""

# Step 1: Verify tables
echo "Step 1: Verifying database tables..."
npm run db:verify

echo ""
echo "Step 2: Generating real-time setup SQL..."
npx ts-node -r tsconfig-paths/register scripts/enable-supabase-realtime.ts

echo ""
echo "✅ Setup verification complete!"
echo ""
echo "📊 Summary:"
echo "   ✅ Database tables: Created"
echo "   ⚠️  Real-time: Needs to be enabled (see SQL above)"
echo "   ⚠️  RLS Policies: Review in Supabase Dashboard"
echo "   ⚠️  Storage Buckets: Create if needed"
echo ""
echo "📋 Next Steps:"
echo "   1. Enable real-time for tables (see SQL above)"
echo "   2. Review RLS policies in Supabase Dashboard"
echo "   3. Create storage buckets: avatars, documents, contracts"
echo "   4. Test API endpoints"
echo "   5. Run integration tests: npm run test:integration"

