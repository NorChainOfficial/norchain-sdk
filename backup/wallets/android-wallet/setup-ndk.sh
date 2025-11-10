#!/bin/bash
# Android NDK Setup Script for Noor Wallet

set -e

echo "========================================="
echo "Noor Wallet - Android NDK Setup"
echo "========================================="
echo ""

# Check for Android SDK
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo "✅ Found Android SDK at: $ANDROID_HOME"
    else
        echo "❌ Android SDK not found!"
        echo ""
        echo "Please install Android Studio from:"
        echo "https://developer.android.com/studio"
        echo ""
        echo "After installation, set ANDROID_HOME:"
        echo "export ANDROID_HOME=\$HOME/Library/Android/sdk"
        exit 1
    fi
fi

# Check for NDK
NDK_VERSION="26.1.10909125"
if [ -d "$ANDROID_HOME/ndk/$NDK_VERSION" ]; then
    export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
    echo "✅ Found NDK at: $ANDROID_NDK_HOME"
elif [ -d "$ANDROID_HOME/ndk" ]; then
    # Find any NDK version
    LATEST_NDK=$(ls -1 "$ANDROID_HOME/ndk" | sort -V | tail -1)
    if [ -n "$LATEST_NDK" ]; then
        export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/$LATEST_NDK"
        echo "✅ Found NDK at: $ANDROID_NDK_HOME"
    else
        echo "⚠️  NDK not found in $ANDROID_HOME/ndk/"
        echo ""
        echo "Installing NDK via sdkmanager..."
        $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "ndk;$NDK_VERSION" || {
            echo ""
            echo "❌ NDK installation failed!"
            echo ""
            echo "Manual installation:"
            echo "1. Open Android Studio"
            echo "2. Preferences > Appearance & Behavior > System Settings > Android SDK"
            echo "3. SDK Tools tab"
            echo "4. Check 'NDK (Side by side)'"
            echo "5. Click Apply"
            exit 1
        }
        export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
    fi
else
    echo "❌ NDK directory not found!"
    echo ""
    echo "Please install NDK via Android Studio:"
    echo "1. Open Android Studio"
    echo "2. Preferences > Appearance & Behavior > System Settings > Android SDK"
    echo "3. SDK Tools tab"
    echo "4. Check 'NDK (Side by side)'"
    echo "5. Click Apply"
    exit 1
fi

echo ""
echo "========================================="
echo "Environment Configuration"
echo "========================================="
echo "ANDROID_HOME=$ANDROID_HOME"
echo "ANDROID_NDK_HOME=$ANDROID_NDK_HOME"
echo ""

# Add to shell profile
SHELL_RC="$HOME/.zshrc"
if ! grep -q "ANDROID_NDK_HOME" "$SHELL_RC" 2>/dev/null; then
    echo "Adding NDK configuration to $SHELL_RC..."
    cat >> "$SHELL_RC" << EOF

# Android NDK Configuration (Noor Wallet)
export ANDROID_HOME=\$HOME/Library/Android/sdk
export ANDROID_NDK_HOME=\$ANDROID_HOME/ndk/$NDK_VERSION
export PATH=\$PATH:\$ANDROID_HOME/platform-tools
EOF
    echo "✅ Added to $SHELL_RC"
    echo "   Run: source $SHELL_RC"
fi

echo ""
echo "========================================="
echo "Building Rust Libraries for Android"
echo "========================================="
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Source cargo environment
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

# Build Android libraries
echo "Building for all Android architectures..."
cd core-rust

cargo ndk -t arm64-v8a -t armeabi-v7a -t x86_64 -t x86 \
    -o ../android-wallet/noor-core/src/main/jniLibs \
    build --release

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Android libraries built successfully!"
    echo ""
    echo "Libraries created:"
    find ../android-wallet/noor-core/src/main/jniLibs -name "*.so" -type f
    echo ""
    echo "========================================="
    echo "Next Steps"
    echo "========================================="
    echo "1. Open Android Studio"
    echo "2. Open android-wallet/ directory"
    echo "3. Let Gradle sync complete"
    echo "4. Build > Make Project"
    echo "5. Run on emulator or device"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "Check that all Rust targets are installed:"
    echo "  rustup target add aarch64-linux-android"
    echo "  rustup target add armv7-linux-androideabi"
    echo "  rustup target add x86_64-linux-android"
    echo "  rustup target add i686-linux-android"
    exit 1
fi
