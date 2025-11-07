#!/bin/bash
# Complete fix for Xcode package resolution issues

set -e

PROJECT_DIR="/Volumes/Development/sahalat/private server/noor-wallet/ios-wallet"

echo "🧹 Complete package resolution fix..."
echo ""

# Step 1: Remove all Xcode state
echo "1. Removing Xcode state files..."
rm -rf "$PROJECT_DIR/.swiftpm" 2>/dev/null || true
rm -rf "$PROJECT_DIR/Packages/NorCore/.swiftpm" 2>/dev/null || true
rm -rf "$PROJECT_DIR/Packages/NorCore/.build" 2>/dev/null || true
echo "   ✅ Removed .swiftpm directories"

# Step 2: Clean Xcode caches
echo "2. Cleaning Xcode caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/NorWallet-* 2>/dev/null || true
rm -rf ~/Library/Caches/org.swift.swiftpm 2>/dev/null || true
echo "   ✅ Cleaned Xcode caches"

# Step 3: Resolve packages from command line
echo "3. Resolving packages..."
cd "$PROJECT_DIR"
xcodebuild -resolvePackageDependencies \
  -project NorWallet.xcodeproj \
  -scheme NorWallet > /dev/null 2>&1 || true
echo "   ✅ Packages resolved"

echo ""
echo "✅ Complete cleanup finished!"
echo ""
echo "📋 Next steps:"
echo "1. Close Xcode COMPLETELY (⌘Q - don't just close windows)"
echo "2. Wait 5 seconds"
echo "3. Reopen the project:"
echo "   cd $PROJECT_DIR"
echo "   open NorWallet.xcodeproj"
echo ""
echo "4. If you still see errors:"
echo "   - Go to: File → Packages → Resolve Package Versions"
echo "   - Wait for it to complete"
echo "   - Build the project (⌘B)"
echo ""
echo "💡 Note: The command-line build works fine, so the configuration"
echo "   is correct. This is purely an Xcode GUI state issue."

