// FFI bindings for Swift and Kotlin
// Uses cbindgen to generate C headers

use crate::{crypto::Wallet, get_nor_chain_id, get_nor_chain_rpc, init_logger, LogLevel, storage};
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

/// C-compatible string structure
#[repr(C)]
pub struct NorString {
    pub ptr: *mut c_char,
    pub len: usize,
}

impl NorString {
    fn from_string(s: String) -> Self {
        let c_string = CString::new(s).unwrap_or_else(|_| CString::new("").unwrap());
        let len = c_string.as_bytes().len();
        Self {
            ptr: c_string.into_raw(),
            len,
        }
    }
}

/// Create a new wallet with random entropy
/// Returns a JSON string containing wallet data
#[no_mangle]
pub extern "C" fn nor_wallet_create() -> NorString {
    let mut entropy = [0u8; 16];
    rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut entropy);

    match Wallet::from_entropy(&entropy, None) {
        Ok(wallet) => {
            let wallet_data = wallet.to_wallet_data();
            let wallet_id = wallet_data.id.clone();

            // Store wallet in global storage
            let _ = storage::store_wallet(wallet_id, wallet);

            match serde_json::to_string(&wallet_data) {
                Ok(json) => NorString::from_string(json),
                Err(_) => NorString::from_string("{}".to_string()),
            }
        }
        Err(_) => NorString::from_string("{}".to_string()),
    }
}

/// Import wallet from mnemonic phrase
/// Returns a JSON string containing wallet data
#[no_mangle]
pub extern "C" fn nor_wallet_from_mnemonic(mnemonic: *const c_char) -> NorString {
    if mnemonic.is_null() {
        return NorString::from_string("{}".to_string());
    }

    let mnemonic_str = unsafe {
        match CStr::from_ptr(mnemonic).to_str() {
            Ok(s) => s,
            Err(_) => return NorString::from_string("{}".to_string()),
        }
    };

    match Wallet::from_mnemonic(mnemonic_str, None) {
        Ok(wallet) => {
            let wallet_data = wallet.to_wallet_data();
            let wallet_id = wallet_data.id.clone();

            // Store wallet in global storage
            let _ = storage::store_wallet(wallet_id, wallet);

            match serde_json::to_string(&wallet_data) {
                Ok(json) => NorString::from_string(json),
                Err(_) => NorString::from_string("{}".to_string()),
            }
        }
        Err(_) => NorString::from_string("{}".to_string()),
    }
}

/// Import wallet from private key
/// Returns a JSON string containing wallet data
#[no_mangle]
pub extern "C" fn nor_wallet_from_private_key(private_key: *const c_char) -> NorString {
    if private_key.is_null() {
        return NorString::from_string("{}".to_string());
    }

    let pk_str = unsafe {
        match CStr::from_ptr(private_key).to_str() {
            Ok(s) => s,
            Err(_) => return NorString::from_string("{}".to_string()),
        }
    };

    match Wallet::from_private_key(pk_str) {
        Ok(wallet) => {
            let wallet_data = wallet.to_wallet_data();
            match serde_json::to_string(&wallet_data) {
                Ok(json) => NorString::from_string(json),
                Err(_) => NorString::from_string("{}".to_string()),
            }
        }
        Err(_) => NorString::from_string("{}".to_string()),
    }
}

/// Get Nor Chain RPC URL
#[no_mangle]
pub extern "C" fn nor_get_chain_rpc() -> NorString {
    NorString::from_string(get_nor_chain_rpc())
}

/// Get Nor Chain ID
#[no_mangle]
pub extern "C" fn nor_get_chain_id() -> u64 {
    get_nor_chain_id()
}

/// Free a NorString allocated by Rust
#[no_mangle]
pub extern "C" fn nor_string_free(s: NorString) {
    if !s.ptr.is_null() {
        unsafe {
            let _ = CString::from_raw(s.ptr);
        }
    }
}

/// Initialize logger with specified level
/// level: 0=Trace, 1=Debug, 2=Info, 3=Warn, 4=Error
#[no_mangle]
pub extern "C" fn nor_init_logger(level: u8) {
    let log_level = match level {
        0 => LogLevel::Trace,
        1 => LogLevel::Debug,
        2 => LogLevel::Info,
        3 => LogLevel::Warn,
        4 => LogLevel::Error,
        _ => LogLevel::Info,
    };
    init_logger(log_level);
}

// Android JNI helper - converts NorString ptr to null-terminated C string
// This is safe to call from JNI GetStringUTFChars pattern
#[no_mangle]
pub extern "C" fn nor_string_get_ptr(s: &NorString) -> *const c_char {
    s.ptr as *const c_char
}

// Android JNI helper - safely get C string from pointer
// Returns the string pointer for JNI string creation
#[no_mangle]
pub extern "C" fn nor_string_get_c_string(ptr: *mut c_char) -> *const c_char {
    if ptr.is_null() {
        return std::ptr::null();
    }
    ptr as *const c_char
}

/// Sign an EVM transaction
/// Returns a signed transaction hex string
#[no_mangle]
pub extern "C" fn nor_sign_transaction(
    from_address: *const c_char,
    to_address: *const c_char,
    value: *const c_char,
    data: *const c_char,
    gas_limit: u64,
    gas_price: *const c_char,
    nonce: u64,
    chain_id: u64,
) -> NorString {
    // Parse C strings
    let from = unsafe { CStr::from_ptr(from_address).to_str().unwrap_or("") };
    let to = unsafe { CStr::from_ptr(to_address).to_str().unwrap_or("") };
    let val = unsafe { CStr::from_ptr(value).to_str().unwrap_or("0") };
    let data_str = unsafe { CStr::from_ptr(data).to_str().unwrap_or("0x") };
    let gp = unsafe { CStr::from_ptr(gas_price).to_str().unwrap_or("0") };

    let params = crate::types::EvmTxParams {
        from: from.to_string(),
        to: to.to_string(),
        value: val.to_string(),
        data: Some(data_str.to_string()),
        gas_limit,
        gas_price: gp.to_string(),
        nonce,
        chain_id,
    };

    match crate::evm::build_transaction(params) {
        Ok(tx) => NorString::from_string(tx.hash),
        Err(_) => NorString::from_string("".to_string()),
    }
}

/// Get mnemonic for a wallet by ID
/// Returns the mnemonic phrase as a string
#[no_mangle]
pub extern "C" fn nor_wallet_get_mnemonic(wallet_id: *const c_char) -> NorString {
    if wallet_id.is_null() {
        return NorString::from_string("".to_string());
    }

    let id = unsafe {
        match CStr::from_ptr(wallet_id).to_str() {
            Ok(s) => s,
            Err(_) => return NorString::from_string("".to_string()),
        }
    };

    if let Ok(wallet) = storage::get_wallet(id) {
        match wallet.export_mnemonic() {
            Ok(mnemonic) => return NorString::from_string(mnemonic),
            Err(_) => return NorString::from_string("".to_string()),
        }
    }

    NorString::from_string("".to_string())
}

/// Get balance for an address via RPC
#[no_mangle]
pub extern "C" fn nor_get_balance(address: *const c_char, rpc_url: *const c_char) -> NorString {
    let addr = unsafe { CStr::from_ptr(address).to_str().unwrap_or("") };
    let rpc = unsafe { CStr::from_ptr(rpc_url).to_str().unwrap_or("") };

    let client = crate::rpc::JsonRpcClient::new(rpc.to_string());
    match client.get_balance(addr.to_string()) {
        Ok(balance) => NorString::from_string(balance),
        Err(_) => NorString::from_string("0".to_string()),
    }
}
