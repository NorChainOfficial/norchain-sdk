#!/bin/bash

# Complete production deployment script
# Builds, verifies, and prepares for App Store submission

set -e

echo "🚀 Production Deployment Script"
echo "================================"
echo ""

cd "$(dirname "$0")"

# Step 1: Verify configuration
echo "📋 Step 1: Verifying configuration..."
if ! ./verify-production.sh; then
  echo "❌ Verification failed - Fix issues before deploying"
  exit 1
fi

echo ""
echo "✅ Configuration verified"
echo ""

# Step 2: Build Release
echo "📦 Step 2: Building Release configuration..."
if ! ./build-release.sh; then
  echo "❌ Build failed"
  exit 1
fi

echo ""
echo "✅ Release build complete"
echo ""

# Step 3: Archive (optional)
read -p "📦 Create archive for App Store? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if ! ./archive-production.sh; then
    echo "❌ Archive failed"
    exit 1
  fi
  echo ""
  echo "✅ Archive created"
fi

echo ""
echo "🎉 Production deployment preparation complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ Configuration verified"
echo "  ✅ Release build successful"
echo ""
echo "📱 Next Steps:"
echo "  1. Test Release build on device/simulator"
echo "  2. If archive created: Open Xcode → Organizer → Distribute"
echo "  3. Submit to App Store Connect"

