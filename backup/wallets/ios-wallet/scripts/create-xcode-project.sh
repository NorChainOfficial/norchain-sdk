#!/bin/bash
# Create Xcode iOS App Project for NorWallet

set -e

cd "$(dirname "$0")"

echo "🚀 Creating Xcode project for NorWallet..."

# Remove old xcodeproj if exists
rm -rf NorWallet.xcodeproj

# Create the project using xcodegen (we'll install if needed)
if ! command -v xcodegen &> /dev/null; then
    echo "📦 Installing xcodegen..."
    brew install xcodegen
fi

# Create project.yml for xcodegen
cat > project.yml << 'EOF'
name: NorWallet
options:
  bundleIdPrefix: com.nor
  deploymentTarget:
    iOS: "15.0"
  
settings:
  base:
    PRODUCT_BUNDLE_IDENTIFIER: com.nor.wallet
    MARKETING_VERSION: "1.0"
    CURRENT_PROJECT_VERSION: "1"
    SWIFT_VERSION: "5.0"
    IPHONEOS_DEPLOYMENT_TARGET: "15.0"
    TARGETED_DEVICE_FAMILY: "1,2"
    INFOPLIST_FILE: NorWallet/Resources/Info.plist
    SWIFT_OBJC_BRIDGING_HEADER: NorWallet/Supporting Files/NorWallet-Bridging-Header.h
    LIBRARY_SEARCH_PATHS: "$(inherited) $(PROJECT_DIR)/../core-rust/target/universal/release"
    HEADER_SEARCH_PATHS: "$(inherited) $(PROJECT_DIR)/NorWallet/Supporting Files"
    OTHER_LDFLAGS: "$(inherited) -lnor_core"

targets:
  NorWallet:
    type: application
    platform: iOS
    sources:
      - NorWallet/App
    settings:
      base:
        PRODUCT_NAME: NorWallet
        PRODUCT_BUNDLE_IDENTIFIER: com.nor.wallet
    dependencies:
      - package: NorCore
    preBuildScripts:
      - script: |
          # Ensure Rust library is built
          if [ ! -f "../core-rust/target/universal/release/libnor_core.a" ]; then
            echo "Building Rust library..."
            cd ../core-rust
            cargo lipo --release || true
          fi
        name: "Build Rust Library"

packages:
  NorCore:
    path: Packages/NorCore

schemes:
  NorWallet:
    build:
      targets:
        NorWallet: all
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
echo "1. Open: open NorWallet.xcodeproj"
echo "2. Select a simulator or device"
echo "3. Press ⌘R to build and run"
