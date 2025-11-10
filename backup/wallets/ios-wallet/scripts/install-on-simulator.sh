#!/bin/bash
# Install and run Noor Wallet on iOS Simulator

set -e

PROJECT_DIR="/Volumes/Development/sahalat/private server/noor-wallet/ios-wallet"
SIMULATOR_NAME="iPhone 16 Pro"
SCHEME="NorWallet"

cd "$PROJECT_DIR"

echo "📱 Installing Noor Wallet on iOS Simulator..."
echo ""

# Step 1: Build the app
echo "1. Building the app..."
xcodebuild -project NorWallet.xcodeproj \
  -scheme "$SCHEME" \
  -destination "platform=iOS Simulator,name=$SIMULATOR_NAME" \
  -configuration Debug \
  build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "   ✅ Build successful"

# Step 2: Get the app path
BUILD_DIR=$(xcodebuild -project NorWallet.xcodeproj \
  -scheme "$SCHEME" \
  -destination "platform=iOS Simulator,name=$SIMULATOR_NAME" \
  -showBuildSettings 2>/dev/null | grep -m 1 "BUILT_PRODUCTS_DIR" | sed 's/.*= *//' | xargs)

APP_PATH="$BUILD_DIR/NorWallet.app"

if [ ! -d "$APP_PATH" ]; then
  echo "❌ App not found at: $APP_PATH"
  exit 1
fi

echo "   ✅ App found: $APP_PATH"

# Step 3: Boot simulator if not running
echo "2. Starting simulator..."
SIMULATOR_ID=$(xcrun simctl list devices available | grep "$SIMULATOR_NAME" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')

if [ -z "$SIMULATOR_ID" ]; then
  echo "❌ Simulator '$SIMULATOR_NAME' not found"
  echo "Available simulators:"
  xcrun simctl list devices available | grep iPhone | head -5
  exit 1
fi

# Boot the simulator
xcrun simctl boot "$SIMULATOR_ID" 2>/dev/null || true
open -a Simulator

# Wait for simulator to be ready
sleep 3

echo "   ✅ Simulator ready"

# Step 4: Install the app
echo "3. Installing app on simulator..."
xcrun simctl install booted "$APP_PATH" 2>/dev/null

if [ $? -ne 0 ]; then
  echo "❌ Installation failed!"
  exit 1
fi

echo "   ✅ App installed"

# Step 5: Launch the app
echo "4. Launching app..."
xcrun simctl launch --console booted com.noor.wallet

if [ $? -eq 0 ]; then
  echo "   ✅ App launched"
  echo ""
  echo "🎉 Noor Wallet is now running on the simulator!"
  echo ""
  echo "💡 To launch again, run:"
  echo "   xcrun simctl launch booted com.noor.wallet"
else
  echo "⚠️  App may already be running"
fi

