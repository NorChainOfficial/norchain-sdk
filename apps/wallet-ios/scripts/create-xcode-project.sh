#!/bin/bash
# Create Xcode iOS App Project for NoorWallet

set -e

cd "$(dirname "$0")"

echo "🚀 Creating Xcode project for NoorWallet..."

# Remove old xcodeproj if exists
rm -rf NoorWallet.xcodeproj

# Create the project using xcodegen (we'll install if needed)
if ! command -v xcodegen &> /dev/null; then
    echo "📦 Installing xcodegen..."
    brew install xcodegen
fi

# Create project.yml for xcodegen
cat > project.yml << 'EOF'
name: NoorWallet
options:
  bundleIdPrefix: com.noor
  deploymentTarget:
    iOS: "15.0"
  
settings:
  base:
    PRODUCT_BUNDLE_IDENTIFIER: com.noor.wallet
    MARKETING_VERSION: "1.0"
    CURRENT_PROJECT_VERSION: "1"
    SWIFT_VERSION: "5.0"
    IPHONEOS_DEPLOYMENT_TARGET: "15.0"
    TARGETED_DEVICE_FAMILY: "1,2"
    INFOPLIST_FILE: NoorWallet/Resources/Info.plist
    SWIFT_OBJC_BRIDGING_HEADER: NoorWallet/Supporting Files/NoorWallet-Bridging-Header.h
    LIBRARY_SEARCH_PATHS: "$(inherited) $(PROJECT_DIR)/../core-rust/target/universal/release"
    HEADER_SEARCH_PATHS: "$(inherited) $(PROJECT_DIR)/NoorWallet/Supporting Files"
    OTHER_LDFLAGS: "$(inherited) -lnoor_core"

targets:
  NoorWallet:
    type: application
    platform: iOS
    sources:
      - NoorWallet/App
    settings:
      base:
        PRODUCT_NAME: NoorWallet
        PRODUCT_BUNDLE_IDENTIFIER: com.noor.wallet
    dependencies:
      - package: NoorCore
    preBuildScripts:
      - script: |
          # Ensure Rust library is built
          if [ ! -f "../core-rust/target/universal/release/libnoor_core.a" ]; then
            echo "Building Rust library..."
            cd ../core-rust
            cargo lipo --release || true
          fi
        name: "Build Rust Library"

packages:
  NoorCore:
    path: Packages/NoorCore

schemes:
  NoorWallet:
    build:
      targets:
        NoorWallet: all
    run:
      config: Debug
    archive:
      config: Release
EOF

# Generate the project
xcodegen generate

echo "✅ Xcode project created successfully!"
echo ""
echo "📱 Next steps:"
echo "1. Open: open NoorWallet.xcodeproj"
echo "2. Select a simulator or device"
echo "3. Press ⌘R to build and run"
