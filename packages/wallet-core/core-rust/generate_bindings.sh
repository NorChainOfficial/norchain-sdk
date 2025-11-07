#!/bin/bash
set -e

echo "🔧 Generating UniFFI bindings..."

# Build the library first
echo "📦 Building Rust library..."
cargo build --release --lib

# Generate Swift bindings
echo "🍎 Generating Swift bindings..."
cargo run --features=uniffi/cli --bin uniffi-bindgen generate \
    --library target/release/libnor_core.dylib \
    --language swift \
    --out-dir ../ios-wallet/Packages/NorCore/Sources/NorCoreFFI \
    src/nor.udl

# Generate Kotlin bindings  
echo "🤖 Generating Kotlin bindings..."
cargo run --features=uniffi/cli --bin uniffi-bindgen generate \
    --library target/release/libnor_core.dylib \
    --language kotlin \
    --out-dir ../android-wallet/nor-core/src/main/java \
    src/nor.udl

echo "✅ Bindings generated successfully!"
