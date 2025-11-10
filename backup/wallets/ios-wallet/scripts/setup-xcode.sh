#!/bin/bash
# Script to create Xcode project for Noor Wallet

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="NoorWallet"
BUNDLE_ID="com.noor.wallet"

echo "Creating Xcode project for $PROJECT_NAME..."

# Navigate to iOS wallet directory
cd "$PROJECT_DIR"

# Create Xcode project using swift package
swift package generate-xcodeproj 2>/dev/null || {
    echo "Note: swift package generate-xcodeproj is deprecated in newer Swift versions"
    echo "Opening Xcode manually to create project..."
}

# Build the universal library
echo "Building Rust universal library..."
cd ../core-rust

# Source cargo environment
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

cargo lipo --release

# Create xcconfig for library paths
cat > "../ios-wallet/NoorWallet.xcconfig" << 'EOF'
// Noor Wallet Xcode Configuration

// Library Search Paths
LIBRARY_SEARCH_PATHS = $(inherited) $(PROJECT_DIR)/../core-rust/target/universal/release

// Header Search Paths
HEADER_SEARCH_PATHS = $(inherited) $(PROJECT_DIR)/NoorWallet/Supporting\ Files

// Swift Compiler - Objective-C Bridging Header
SWIFT_OBJC_BRIDGING_HEADER = $(PROJECT_DIR)/NoorWallet/Supporting\ Files/NoorWallet-Bridging-Header.h

// Other Linker Flags
OTHER_LDFLAGS = $(inherited) -lnoor_core
EOF

echo "✅ Configuration created at ios-wallet/NoorWallet.xcconfig"
echo ""
echo "Next steps:"
echo "1. Open Xcode"
echo "2. File > New > Project"
echo "3. Choose iOS > App"
echo "4. Product Name: NoorWallet"
echo "5. Bundle Identifier: com.noor.wallet"
echo "6. Interface: SwiftUI"
echo "7. Save in: ios-wallet/"
echo ""
echo "8. Add existing files:"
echo "   - NoorWallet/App/*.swift"
echo "   - NoorWallet/Resources/Info.plist"
echo "   - NoorWallet/Supporting Files/*"
echo ""
echo "9. In Build Settings:"
echo "   - Import NoorWallet.xcconfig"
echo "   - Set Library Search Paths to: \$(PROJECT_DIR)/../core-rust/target/universal/release"
echo "   - Set Header Search Paths to: \$(PROJECT_DIR)/NoorWallet/Supporting Files"
echo "   - Set Swift Bridging Header to: \$(PROJECT_DIR)/NoorWallet/Supporting Files/NoorWallet-Bridging-Header.h"
echo "   - Add -lnoor_core to Other Linker Flags"
echo ""
echo "10. Add NoorCore package:"
echo "    - File > Add Packages"
echo "    - Add Local > Select Packages/NoorCore"
echo ""
echo "11. In General > Frameworks, Libraries:"
echo "    - Add libnoor_core.a from core-rust/target/universal/release/"
echo "    - Add NoorCore package"
echo ""
echo "Build and run!"
