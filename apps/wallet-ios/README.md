# NorChain Wallet - iOS

Native iOS wallet application built with SwiftUI and Swift.

## Features

- ✅ Wallet creation (mnemonic)
- ✅ Wallet import (mnemonic/private key)
- ✅ Send transactions
- ✅ Receive transactions
- ✅ Transaction history
- ✅ Multi-account support
- ✅ Keychain integration
- ✅ Supabase sync
- ✅ Native Rust core integration

## Requirements

- Xcode 15.0 or later
- iOS 15.0+ deployment target
- Swift 5.9+
- macOS 13.0+ (for development)

## Setup

```bash
cd apps/wallet-ios

# Open in Xcode
open NorWallet.xcodeproj

# Or use script
./scripts/open-xcode.sh

# Build
xcodebuild -project NorWallet.xcodeproj -scheme NorWallet -sdk iphonesimulator
```

## Configuration

### API Configuration

Update `NorWallet.xcconfig`:

```xcconfig
API_URL = http://localhost:4000
RPC_URL = https://rpc.norchain.org
CHAIN_ID = 65001
```

Or add to `Info.plist`:

```xml
<key>API_URL</key>
<string>http://localhost:4000</string>
<key>RPC_URL</key>
<string>https://rpc.norchain.org</string>
<key>CHAIN_ID</key>
<integer>65001</integer>
```

### Supabase Configuration

Update `NorWallet/Services/SupabaseService.swift`:

```swift
struct SupabaseConfig {
    static let url = "your-supabase-url"
    static let anonKey = "your-supabase-key"
}
```

## Build

```bash
# Debug build
xcodebuild -project NorWallet.xcodeproj -scheme NorWallet -configuration Debug

# Release build
./scripts/build-release.sh

# Archive for App Store
./scripts/archive-production.sh
```

## Testing

```bash
# Unit tests
xcodebuild test -project NorWallet.xcodeproj -scheme NorWallet -destination 'platform=iOS Simulator,name=iPhone 15'

# UI tests
xcodebuild test -project NorWallet.xcodeproj -scheme NorWalletUITests -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Project Structure

```
wallet-ios/
├── NorWallet/            # Main app target
│   ├── App/              # SwiftUI views
│   ├── Services/          # Backend services
│   ├── Resources/        # Assets, Info.plist
│   └── Supporting Files/ # Headers, bridging
├── NorWalletTests/       # Unit tests
├── NorWalletUITests/     # UI tests
├── Packages/
│   └── NorCore/          # Rust core package
└── NorWallet.xcodeproj/  # Xcode project
```

## Integration with Unified API

To connect to the Unified API:

1. Add API client service
2. Update ViewModels to use API client
3. Replace Supabase calls with API calls
4. Configure API URL in xcconfig or Info.plist

See `MOBILE_APPS_INTEGRATION.md` for details.

## Native Core

The app uses native Rust libraries via Swift Package Manager:
- `NorCore` Swift package
- Rust FFI bindings
- Swift wrapper around Rust functions

## Scripts

- `open-xcode.sh` - Open project in Xcode
- `build-release.sh` - Build release version
- `archive-production.sh` - Create archive for App Store
- `install-on-simulator.sh` - Install on simulator
- `deploy-production.sh` - Deploy to App Store

## License

MIT

