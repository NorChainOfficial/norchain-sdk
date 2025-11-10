// Shared wallet storage module
// Provides centralized access to wallet storage for all modules

use crate::crypto::Wallet;
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::Mutex;

lazy_static! {
    pub static ref WALLET_STORAGE: Mutex<HashMap<String, Wallet>> = Mutex::new(HashMap::new());
}

pub fn get_wallet(wallet_id: &str) -> Result<Wallet, crate::error::CoreError> {
    let wallets = WALLET_STORAGE.lock().map_err(|_| crate::error::CoreError::InternalError)?;
    wallets.get(wallet_id).cloned().ok_or(crate::error::CoreError::InvalidInput)
}

pub fn store_wallet(wallet_id: String, wallet: Wallet) -> Result<(), crate::error::CoreError> {
    let mut wallets = WALLET_STORAGE.lock().map_err(|_| crate::error::CoreError::InternalError)?;
    wallets.insert(wallet_id, wallet);
    Ok(())
}

