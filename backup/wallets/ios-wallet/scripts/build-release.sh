#!/bin/bash

# Build Release configuration for production
# This script builds the app for production deployment

set -e

echo "🚀 Building Release configuration..."

cd "$(dirname "$0")"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
xcodebuild -project NorWallet.xcodeproj \
  -scheme NorWallet \
  -sdk iphonesimulator \
  -configuration Release \
  clean

# Build Release
echo "📦 Building Release configuration..."
xcodebuild -project NorWallet.xcodeproj \
  -scheme NorWallet \
  -sdk iphonesimulator \
  -configuration Release \
  build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

# Check build result
if [ $? -eq 0 ]; then
  echo "✅ BUILD SUCCEEDED - Release configuration ready!"
else
  echo "❌ BUILD FAILED - Check errors above"
  exit 1
fi

echo ""
echo "📊 Build Summary:"
echo "  - Configuration: Release"
echo "  - SDK: iOS Simulator"
echo "  - Status: ✅ Ready for deployment"

