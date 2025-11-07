use serde::{Deserialize, Serialize};

// UniFFI types are defined in xaheen.udl - don't use derive macros here
#[derive(Debug, Clone, Copy)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub address: String,
    pub public_key: String,
    pub index: u32,
    pub derivation_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallet {
    pub id: String,
    pub accounts: Vec<Account>,
    pub created_at: std::time::SystemTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmTxParams {
    pub from: String,
    pub to: String,
    pub value: String,
    pub data: Option<String>,
    pub gas_limit: u64,
    pub gas_price: String,
    pub nonce: u64,
    pub chain_id: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvmTransaction {
    pub hash: String,
    pub signed_tx: String,
    pub block_hash: Option<String>,
    pub block_number: Option<u64>,
    pub timestamp: Option<std::time::SystemTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GasEstimate {
    pub gas_limit: String,
    pub gas_price: String,
    pub max_fee: String,
    pub total_cost: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserOpParams {
    pub sender: String,
    pub nonce: String,
    pub init_code: String,
    pub call_data: String,
    pub call_gas_limit: String,
    pub verification_gas_limit: String,
    pub pre_verification_gas: String,
    pub max_fee_per_gas: String,
    pub max_priority_fee_per_gas: String,
    pub paymaster_and_data: String,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserOperation {
    pub params: UserOpParams,
    pub hash: String,
    pub entry_point: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationResult {
    pub success: bool,
    pub error: Option<String>,
    pub state_changes: Vec<StateChange>,
    pub allowance_changes: Vec<AllowanceChange>,
    pub token_transfers: Vec<TokenTransfer>,
    pub gas_estimate: GasEstimate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateChange {
    pub address: String,
    pub key: String,
    pub old_value: String,
    pub new_value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AllowanceChange {
    pub token: String,
    pub owner: String,
    pub spender: String,
    pub old_allowance: String,
    pub new_allowance: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenTransfer {
    pub token: String,
    pub from: String,
    pub to: String,
    pub amount: String,
    pub token_symbol: Option<String>,
    pub decimals: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafetyReport {
    pub is_safe: bool,
    pub warnings: Vec<String>,
    pub critical_issues: Vec<String>,
    pub simulation: SimulationResult,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TronTxParams {
    pub from: String,
    pub to: String,
    pub amount: i64,
    pub contract_address: Option<String>,
    pub data: Option<String>,
    pub fee_limit: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TronTransaction {
    pub txid: String,
    pub raw_data: String,
    pub signed_tx: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcRequest {
    pub method: String,
    pub params: String,
    pub id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcResponse {
    pub result: Option<String>,
    pub error: Option<String>,
    pub id: Option<String>,
}
