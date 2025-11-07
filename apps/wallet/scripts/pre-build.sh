#!/bin/bash

# Pre-build validation script
# Run before building for production

set -e

echo "🔍 Running pre-build checks..."

cd "$(dirname "$0")/../" # Navigate to web-wallet directory

# Validate environment
./scripts/validate-env.sh

# Check dependencies
echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
else
    echo "✅ Dependencies installed"
fi

# Type check
echo ""
echo "🔍 Running type check..."
npm run build -- --no-lint 2>&1 | grep -q "error" && {
    echo "❌ Type check failed"
    exit 1
} || echo "✅ Type check passed"

echo ""
echo "✅ Pre-build checks passed!"
echo "Ready to build for production"

