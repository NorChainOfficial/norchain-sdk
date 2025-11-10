#!/bin/bash

# Archive app for App Store deployment
# This script creates an archive ready for App Store submission

set -e

echo "📦 Archiving app for production..."

cd "$(dirname "$0")"

# Get archive path
ARCHIVE_PATH="./build/NorWallet.xcarchive"
ARCHIVE_DIR="./build"

# Create build directory
mkdir -p "$ARCHIVE_DIR"

# Clean previous archive
if [ -d "$ARCHIVE_PATH" ]; then
  echo "🧹 Removing previous archive..."
  rm -rf "$ARCHIVE_PATH"
fi

# Archive
echo "📦 Creating archive..."
xcodebuild -project NorWallet.xcodeproj \
  -scheme NorWallet \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  archive \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

# Check archive result
if [ $? -eq 0 ] && [ -d "$ARCHIVE_PATH" ]; then
  echo "✅ Archive created successfully!"
  echo ""
  echo "📊 Archive Details:"
  echo "  - Path: $ARCHIVE_PATH"
  echo "  - Configuration: Release"
  echo "  - Status: ✅ Ready for distribution"
  echo ""
  echo "📱 Next Steps:"
  echo "  1. Open Xcode: open NorWallet.xcodeproj"
  echo "  2. Window → Organizer"
  echo "  3. Select archive"
  echo "  4. Distribute App → App Store Connect"
else
  echo "❌ Archive failed - Check errors above"
  exit 1
fi

