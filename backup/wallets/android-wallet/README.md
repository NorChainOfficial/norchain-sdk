# NorChain Wallet - Android

Native Android wallet application built with Kotlin and Jetpack Compose.

## Features

- ✅ Wallet creation (mnemonic)
- ✅ Wallet import (mnemonic/private key)
- ✅ Send transactions
- ✅ Receive transactions
- ✅ Transaction history
- ✅ Multi-account support
- ✅ Supabase sync
- ✅ Native Rust core integration

## Requirements

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- NDK (for Rust core)

## Setup

```bash
cd apps/wallet-android

# Setup NDK (if not already done)
./setup-ndk.sh

# Build
./gradlew build

# Install on connected device
./gradlew installDebug
```

## Configuration

### API Configuration

Update `app/build.gradle.kts`:

```kotlin
android {
    defaultConfig {
        buildConfigField("String", "API_URL", "\"http://localhost:4000\"")
        buildConfigField("String", "RPC_URL", "\"https://rpc.norchain.org\"")
        buildConfigField("Int", "CHAIN_ID", "65001")
    }
}
```

### Supabase Configuration

Update `app/src/main/java/com/nor/wallet/services/SupabaseConfig.kt`:

```kotlin
object SupabaseConfig {
    const val SUPABASE_URL = "your-supabase-url"
    const val SUPABASE_ANON_KEY = "your-supabase-key"
}
```

## Build

```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease
```

## Testing

```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest
```

## Project Structure

```
wallet-android/
├── app/                  # Main application
│   ├── src/main/
│   │   ├── java/com/nor/wallet/
│   │   │   ├── MainActivity.kt
│   │   │   ├── WalletService.kt
│   │   │   ├── services/        # Backend services
│   │   │   ├── ui/              # Compose UI
│   │   │   └── viewmodels/      # ViewModels
│   │   └── res/                 # Resources
├── nor-core/            # Rust core module
└── build.gradle.kts
```

## Integration with Unified API

To connect to the Unified API:

1. Add API client service
2. Update ViewModels to use API client
3. Replace Supabase calls with API calls
4. Configure API URL in build config

See `MOBILE_APPS_INTEGRATION.md` for details.

## Native Core

The app uses native Rust libraries via JNI:
- `libnor_core.so` for multiple architectures
- Kotlin bindings in `nor-core` module

## License

MIT

