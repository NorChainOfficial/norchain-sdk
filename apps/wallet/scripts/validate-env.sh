#!/bin/bash

# Validate environment variables for Web app

set -e

echo "🔍 Validating environment variables..."

cd "$(dirname "$0")/../" # Navigate to web-wallet directory

ERRORS=0

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "   Create it from .env.local.example"
    ERRORS=$((ERRORS+1))
else
    echo "✅ .env.local file exists"
    
    # Check required variables
    if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local || \
       grep -q "NEXT_PUBLIC_SUPABASE_URL=$" .env.local; then
        echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local"
        ERRORS=$((ERRORS+1))
    else
        echo "✅ NEXT_PUBLIC_SUPABASE_URL is set"
    fi
    
    if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local || \
       grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=$" .env.local; then
        echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local"
        ERRORS=$((ERRORS+1))
    else
        echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    fi
fi

# Check if .env.local.example exists
if [ ! -f ".env.local.example" ]; then
    echo "⚠️  Warning: .env.local.example not found"
else
    echo "✅ .env.local.example exists"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ All environment variables are configured!"
else
    echo "❌ Found $ERRORS issue(s) - Please fix them"
    exit 1
fi

