#!/bin/bash
# Fix Xcode package resolution issues

echo "🧹 Cleaning Xcode package state..."

# Remove Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/NorWallet-* 2>/dev/null
echo "✅ Removed DerivedData"

# Remove package Xcode state
rm -rf Packages/NorCore/.swiftpm/xcode 2>/dev/null
echo "✅ Removed package Xcode state"

# Remove SwiftPM cache (optional, more aggressive)
# rm -rf ~/Library/Caches/org.swift.swiftpm 2>/dev/null

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Close Xcode completely (⌘Q)"
echo "2. Reopen the project:"
echo "   open NorWallet.xcodeproj"
echo "3. Go to File → Packages → Resolve Package Versions"
echo ""
