// Nor Wallet Core - Shared Rust implementation for iOS and Android
// Provides cryptographic operations, wallet management, and blockchain interactions

mod aa;
mod config;
mod crypto;
mod error;
mod evm;
mod ffi;
mod network;
mod rpc;
mod simulation;
mod storage;
mod tron;
mod types;

pub use config::{NetworkConfig, NOR_CHAIN_ID, NOR_CHAIN_RPC_URL};
pub use error::{CoreError, Result};
pub use network::{NetworkInfo, NetworkManager};
pub use types::*;

use tracing::Level;
use tracing_subscriber;

// Get Nor Chain RPC URL
pub fn get_nor_chain_rpc() -> String {
    config::NOR_CHAIN_RPC_URL.to_string()
}

// Get Nor Chain ID
pub fn get_nor_chain_id() -> u64 {
    config::NOR_CHAIN_ID
}

// Initialize logging
pub fn init_logger(level: LogLevel) {
    #[cfg(target_os = "android")]
    {
        use log::LevelFilter as LogLevelFilter;
        android_logger::init_once(
            android_logger::Config::default()
                .with_max_level(match level {
                    LogLevel::Trace => LogLevelFilter::Trace,
                    LogLevel::Debug => LogLevelFilter::Debug,
                    LogLevel::Info => LogLevelFilter::Info,
                    LogLevel::Warn => LogLevelFilter::Warn,
                    LogLevel::Error => LogLevelFilter::Error,
                })
                .with_tag("NorCore"),
        );
    }

    #[cfg(target_os = "ios")]
    {
        // On iOS, use OSLog instead of stdout-based logging
        use log::LevelFilter as LogLevelFilter;
        oslog::OsLogger::new("com.nor.wallet")
            .level_filter(match level {
                LogLevel::Trace => LogLevelFilter::Trace,
                LogLevel::Debug => LogLevelFilter::Debug,
                LogLevel::Info => LogLevelFilter::Info,
                LogLevel::Warn => LogLevelFilter::Warn,
                LogLevel::Error => LogLevelFilter::Error,
            })
            .init()
            .ok(); // Ignore error if already initialized
    }

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        let tracing_level = match level {
            LogLevel::Trace => Level::TRACE,
            LogLevel::Debug => Level::DEBUG,
            LogLevel::Info => Level::INFO,
            LogLevel::Warn => Level::WARN,
            LogLevel::Error => Level::ERROR,
        };
        use tracing_subscriber::fmt;
        let _ = fmt().with_max_level(tracing_level).try_init();
    }
}

// Wallet Manager implementation
pub struct WalletManager {
    wallets: std::sync::Arc<std::sync::RwLock<std::collections::HashMap<String, crypto::Wallet>>>,
}

impl WalletManager {
    pub fn new() -> Result<Self> {
        Ok(Self {
            wallets: std::sync::Arc::new(std::sync::RwLock::new(std::collections::HashMap::new())),
        })
    }

    pub fn create_wallet(&self, entropy: Vec<u8>, passphrase: Option<String>) -> Result<Wallet> {
        let wallet = crypto::Wallet::from_entropy(&entropy, passphrase.as_deref())?;
        let wallet_data = wallet.to_wallet_data();

        let mut wallets = self.wallets.write().unwrap();
        wallets.insert(wallet_data.id.clone(), wallet);

        Ok(wallet_data)
    }

    pub fn import_from_mnemonic(
        &self,
        mnemonic: String,
        passphrase: Option<String>,
    ) -> Result<Wallet> {
        let wallet = crypto::Wallet::from_mnemonic(&mnemonic, passphrase.as_deref())?;
        let wallet_data = wallet.to_wallet_data();

        let mut wallets = self.wallets.write().unwrap();
        wallets.insert(wallet_data.id.clone(), wallet);

        Ok(wallet_data)
    }

    pub fn import_from_private_key(&self, private_key: String) -> Result<Wallet> {
        let wallet = crypto::Wallet::from_private_key(&private_key)?;
        let wallet_data = wallet.to_wallet_data();

        let mut wallets = self.wallets.write().unwrap();
        wallets.insert(wallet_data.id.clone(), wallet);

        Ok(wallet_data)
    }

    pub fn export_mnemonic(&self, wallet_id: String) -> Result<String> {
        let wallets = self.wallets.read().unwrap();
        let wallet = wallets.get(&wallet_id).ok_or(CoreError::InvalidInput)?;
        wallet.export_mnemonic()
    }

    pub fn export_private_key(&self, wallet_id: String, account_index: u32) -> Result<String> {
        let wallets = self.wallets.read().unwrap();
        let wallet = wallets.get(&wallet_id).ok_or(CoreError::InvalidInput)?;
        wallet.export_private_key(account_index)
    }

    pub fn derive_account(&self, wallet_id: String, index: u32) -> Result<Account> {
        let mut wallets = self.wallets.write().unwrap();
        let wallet = wallets.get_mut(&wallet_id).ok_or(CoreError::InvalidInput)?;
        wallet.derive_account(index)
    }

    pub fn derive_accounts(
        &self,
        wallet_id: String,
        start_index: u32,
        count: u32,
    ) -> Result<Vec<Account>> {
        let mut wallets = self.wallets.write().unwrap();
        let wallet = wallets.get_mut(&wallet_id).ok_or(CoreError::InvalidInput)?;

        let mut accounts = Vec::new();
        for i in start_index..(start_index + count) {
            accounts.push(wallet.derive_account(i)?);
        }
        Ok(accounts)
    }
}

// EVM Manager implementation
pub struct EvmManager;

impl EvmManager {
    pub fn new() -> Result<Self> {
        Ok(Self)
    }

    pub fn build_transaction(&self, params: EvmTxParams) -> Result<EvmTransaction> {
        evm::build_transaction(params)
    }

    pub fn sign_transaction(
        &self,
        wallet_id: String,
        account_index: u32,
        params: EvmTxParams,
    ) -> Result<String> {
        // This would need access to WalletManager - to be refactored
        evm::sign_transaction(wallet_id, account_index, params)
    }

    pub fn sign_message(
        &self,
        wallet_id: String,
        account_index: u32,
        message: String,
    ) -> Result<String> {
        evm::sign_message(wallet_id, account_index, message)
    }

    pub fn sign_typed_data(
        &self,
        wallet_id: String,
        account_index: u32,
        typed_data_json: String,
    ) -> Result<String> {
        evm::sign_typed_data(wallet_id, account_index, typed_data_json)
    }

    pub fn recover_signer(&self, message: String, signature: String) -> Result<String> {
        evm::recover_signer(message, signature)
    }

    pub fn estimate_gas(&self, params: EvmTxParams, rpc_url: String) -> Result<GasEstimate> {
        evm::estimate_gas(params, rpc_url)
    }
}

// Account Abstraction Manager
pub struct AaManager;

impl AaManager {
    pub fn new() -> Result<Self> {
        Ok(Self)
    }

    pub fn create_account(
        &self,
        owner_address: String,
        chain_id: u64,
        entry_point: String,
    ) -> Result<String> {
        aa::create_account(owner_address, chain_id, entry_point)
    }

    pub fn build_user_operation(&self, params: UserOpParams) -> Result<UserOperation> {
        aa::build_user_operation(params)
    }

    pub fn sign_user_operation(
        &self,
        wallet_id: String,
        account_index: u32,
        params: UserOpParams,
    ) -> Result<String> {
        aa::sign_user_operation(wallet_id, account_index, params)
    }

    pub fn estimate_user_op_gas(
        &self,
        params: UserOpParams,
        bundler_url: String,
    ) -> Result<GasEstimate> {
        aa::estimate_user_op_gas(params, bundler_url)
    }

    pub fn send_user_operation(&self, params: UserOpParams, bundler_url: String) -> Result<String> {
        aa::send_user_operation(params, bundler_url)
    }
}

// TRON Manager
pub struct TronManager;

impl TronManager {
    pub fn new() -> Result<Self> {
        Ok(Self)
    }

    pub fn build_transaction(&self, params: TronTxParams) -> Result<TronTransaction> {
        tron::build_transaction(params)
    }

    pub fn sign_transaction(
        &self,
        wallet_id: String,
        account_index: u32,
        params: TronTxParams,
    ) -> Result<String> {
        tron::sign_transaction(wallet_id, account_index, params)
    }

    pub fn sign_message(
        &self,
        wallet_id: String,
        account_index: u32,
        message: String,
    ) -> Result<String> {
        tron::sign_message(wallet_id, account_index, message)
    }

    pub fn validate_address(&self, address: String) -> Result<bool> {
        tron::validate_address(address)
    }
}

// RPC Client
pub struct RpcClient {
    client: rpc::JsonRpcClient,
}

impl RpcClient {
    pub fn new(rpc_url: String) -> Result<Self> {
        Ok(Self {
            client: rpc::JsonRpcClient::new(rpc_url),
        })
    }

    pub fn call(&self, method: String, params_json: String) -> Result<RpcResponse> {
        self.client.call(method, params_json)
    }

    pub fn batch_call(&self, requests: Vec<RpcRequest>) -> Result<Vec<RpcResponse>> {
        self.client.batch_call(requests)
    }

    pub fn get_balance(&self, address: String) -> Result<String> {
        self.client.get_balance(address)
    }

    pub fn get_nonce(&self, address: String) -> Result<u64> {
        self.client.get_nonce(address)
    }

    pub fn get_chain_id(&self) -> Result<u64> {
        self.client.get_chain_id()
    }

    pub fn get_block_number(&self) -> Result<String> {
        self.client.get_block_number()
    }
}

// Simulation Engine
pub struct SimulationEngine;

impl SimulationEngine {
    pub fn new() -> Result<Self> {
        Ok(Self)
    }

    pub fn simulate_transaction(
        &self,
        params: EvmTxParams,
        rpc_url: String,
    ) -> Result<SimulationResult> {
        simulation::simulate_transaction(params, rpc_url)
    }

    pub fn analyze_transaction(
        &self,
        params: EvmTxParams,
        rpc_url: String,
    ) -> Result<SafetyReport> {
        simulation::analyze_transaction(params, rpc_url)
    }

    pub fn check_allowance(
        &self,
        token: String,
        owner: String,
        spender: String,
        rpc_url: String,
    ) -> Result<String> {
        simulation::check_allowance(token, owner, spender, rpc_url)
    }

    pub fn decode_token_transfers(
        &self,
        tx_hash: String,
        rpc_url: String,
    ) -> Result<Vec<TokenTransfer>> {
        simulation::decode_token_transfers(tx_hash, rpc_url)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wallet_creation() {
        let manager = WalletManager::new().unwrap();
        let entropy = vec![0u8; 32];
        let wallet = manager.create_wallet(entropy, None).unwrap();

        assert!(!wallet.id.is_empty());
        assert_eq!(wallet.accounts.len(), 1);
    }
}
