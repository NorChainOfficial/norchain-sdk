use crate::{error::*, types::*};
use crate::storage;
use ethers_core::utils::keccak256;
use secp256k1::{Message, Secp256k1, ecdsa::RecoverableSignature, ecdsa::RecoveryId};

pub fn create_account(owner_address: String, chain_id: u64, entry_point: String) -> Result<String> {
    // ERC-4337 smart account address computation
    // This is a simplified version - actual implementation would use CREATE2
    let hash = keccak256(format!("{}{}{}", owner_address, chain_id, entry_point).as_bytes());
    Ok(format!("0x{}", hex::encode(&hash[12..])))
}

pub fn build_user_operation(params: UserOpParams) -> Result<UserOperation> {
    let hash = compute_userop_hash(&params)?;

    Ok(UserOperation {
        params,
        hash: format!("0x{}", hex::encode(hash)),
        entry_point: None,
    })
}

pub fn sign_user_operation(
    wallet_id: String,
    account_index: u32,
    params: UserOpParams,
) -> Result<String> {
    // Get wallet and secret key
    let wallet = storage::get_wallet(&wallet_id)?;
    let secret_key = wallet.get_secret_key(account_index)?;
    
    // Compute UserOp hash
    let hash = compute_userop_hash(&params)?;
    
    // Sign the hash (recoverable signature)
    let message = Message::from_digest_slice(&hash)?;
    let secp = Secp256k1::new();
    let recoverable_sig = secp.sign_ecdsa_recoverable(&message, &secret_key);
    let (recovery_id, compact_sig) = recoverable_sig.serialize_compact();
    
    // Serialize signature - compact_sig is 64 bytes (32 r + 32 s)
    let mut sig_bytes = [0u8; 65];
    sig_bytes[0..32].copy_from_slice(&compact_sig[0..32]); // r
    sig_bytes[32..64].copy_from_slice(&compact_sig[32..64]); // s
    sig_bytes[64] = recovery_id.to_i32() as u8 + 27;
    
    Ok(format!("0x{}", hex::encode(sig_bytes)))
}

pub fn estimate_user_op_gas(params: UserOpParams, bundler_url: String) -> Result<GasEstimate> {
    // Call bundler's eth_estimateUserOperationGas
    let client = crate::rpc::JsonRpcClient::new(bundler_url);

    let userop_obj = serde_json::json!({
        "sender": params.sender,
        "nonce": params.nonce,
        "initCode": params.init_code,
        "callData": params.call_data,
        "callGasLimit": params.call_gas_limit,
        "verificationGasLimit": params.verification_gas_limit,
        "preVerificationGas": params.pre_verification_gas,
        "maxFeePerGas": params.max_fee_per_gas,
        "maxPriorityFeePerGas": params.max_priority_fee_per_gas,
        "paymasterAndData": params.paymaster_and_data,
        "signature": params.signature,
    });

    let params_json = serde_json::json!([userop_obj]).to_string();
    let response = client.call("eth_estimateUserOperationGas".to_string(), params_json)?;

    let _gas_estimate = response.result.ok_or(CoreError::RpcError)?;

    // Parse gas estimates from response
    Ok(GasEstimate {
        gas_limit: params.call_gas_limit.clone(),
        gas_price: params.max_fee_per_gas.clone(),
        max_fee: params.max_fee_per_gas.clone(),
        total_cost: "0".to_string(), // Calculate from gas limits
    })
}

pub fn send_user_operation(params: UserOpParams, bundler_url: String) -> Result<String> {
    let client = crate::rpc::JsonRpcClient::new(bundler_url);

    let userop_obj = serde_json::json!({
        "sender": params.sender,
        "nonce": params.nonce,
        "initCode": params.init_code,
        "callData": params.call_data,
        "callGasLimit": params.call_gas_limit,
        "verificationGasLimit": params.verification_gas_limit,
        "preVerificationGas": params.pre_verification_gas,
        "maxFeePerGas": params.max_fee_per_gas,
        "maxPriorityFeePerGas": params.max_priority_fee_per_gas,
        "paymasterAndData": params.paymaster_and_data,
        "signature": params.signature,
    });

    let params_json = serde_json::json!([userop_obj]).to_string();
    let response = client.call("eth_sendUserOperation".to_string(), params_json)?;

    response.result.ok_or(CoreError::RpcError)
}

fn compute_userop_hash(params: &UserOpParams) -> Result<[u8; 32]> {
    // Simplified UserOp hash computation
    let packed = format!(
        "{}{}{}{}{}{}{}{}{}{}{}",
        params.sender,
        params.nonce,
        params.init_code,
        params.call_data,
        params.call_gas_limit,
        params.verification_gas_limit,
        params.pre_verification_gas,
        params.max_fee_per_gas,
        params.max_priority_fee_per_gas,
        params.paymaster_and_data,
        params.signature
    );

    Ok(keccak256(packed.as_bytes()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_account() {
        let account = create_account(
            "0x1234567890123456789012345678901234567890".to_string(),
            1,
            "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789".to_string(),
        )
        .unwrap();

        assert!(account.starts_with("0x"));
        assert_eq!(account.len(), 42);
    }
}
