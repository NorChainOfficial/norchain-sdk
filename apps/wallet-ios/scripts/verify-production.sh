#!/bin/bash

# Verify production configuration
# Checks that all production settings are correct

set -e

echo "🔍 Verifying production configuration..."

cd "$(dirname "$0")"

ERRORS=0

# Check SupabaseConfig.swift exists
if [ ! -f "NorWallet/App/Services/SupabaseConfig.swift" ]; then
  echo "❌ SupabaseConfig.swift not found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ SupabaseConfig.swift exists"
  
  # Check production URL is set
  if grep -q "TODO.*production" "NorWallet/App/Services/SupabaseConfig.swift"; then
    echo "⚠️  Production URL/key may need updating"
  else
    echo "✅ Production credentials configured"
  fi
fi

# Check debug logging is conditional
if grep -r "print(" "NorWallet/App/Services" | grep -v "SupabaseConfig.enableDebugLogging" | grep -v "SupabaseTestView" | grep -v "// " | grep -v "^\s*//"; then
  echo "⚠️  Found print statements without debug checks"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ All debug logging is conditional"
fi

# Check test view is conditional
if grep -q "#if DEBUG\|SupabaseConfig.enableTestView" "NorWallet/App/SettingsView.swift"; then
  echo "✅ Test view is conditionally shown"
else
  echo "❌ Test view may not be conditional"
  ERRORS=$((ERRORS + 1))
fi

# Try to build Release
echo ""
echo "🔨 Testing Release build..."
if xcodebuild -project NorWallet.xcodeproj \
  -scheme NorWallet \
  -sdk iphonesimulator \
  -configuration Release \
  build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  2>&1 | grep -q "BUILD SUCCEEDED"; then
  echo "✅ Release build succeeds"
else
  echo "❌ Release build failed"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ All production checks passed!"
  exit 0
else
  echo "❌ Found $ERRORS issue(s) - Please review"
  exit 1
fi

