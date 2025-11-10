use crate::{error::*, types::*};
use crate::storage;
use ethers_core::{
    types::{transaction::eip2718::TypedTransaction, Eip1559TransactionRequest, Signature},
    utils::keccak256,
};
use rlp::RlpStream;
use secp256k1::{Message, Secp256k1, ecdsa::RecoverableSignature, ecdsa::RecoveryId};

pub fn build_transaction(params: EvmTxParams) -> Result<EvmTransaction> {
    let tx_hash = compute_tx_hash(&params)?;

    Ok(EvmTransaction {
        hash: format!("0x{}", hex::encode(tx_hash)),
        signed_tx: String::new(),
        block_hash: None,
        block_number: None,
        timestamp: None,
    })
}

pub fn sign_transaction(
    wallet_id: String,
    account_index: u32,
    params: EvmTxParams,
) -> Result<String> {
    // Get wallet and secret key
    let wallet = storage::get_wallet(&wallet_id)?;
    let secret_key = wallet.get_secret_key(account_index)?;
    
    // Build transaction hash
    let tx_hash = compute_tx_hash(&params)?;
    let message = Message::from_digest_slice(&tx_hash)?;
    
    // Sign with secp256k1 (recoverable signature)
    let secp = Secp256k1::new();
    let recoverable_sig = secp.sign_ecdsa_recoverable(&message, &secret_key);
    let (recovery_id, compact_sig) = recoverable_sig.serialize_compact();
    
    // Serialize signature (r, s, v) - compact_sig is 64 bytes (32 r + 32 s)
    let mut sig_bytes = [0u8; 65];
    sig_bytes[0..32].copy_from_slice(&compact_sig[0..32]); // r
    sig_bytes[32..64].copy_from_slice(&compact_sig[32..64]); // s
    sig_bytes[64] = recovery_id.to_i32() as u8 + 27; // Ethereum v = recovery_id + 27
    
    Ok(format!("0x{}", hex::encode(sig_bytes)))
}

pub fn sign_message(wallet_id: String, account_index: u32, message: String) -> Result<String> {
    // Get wallet and secret key
    let wallet = storage::get_wallet(&wallet_id)?;
    let secret_key = wallet.get_secret_key(account_index)?;
    
    // EIP-191 personal_sign implementation
    let prefix = format!("\x19Ethereum Signed Message:\n{}", message.len());
    let prefixed_message = format!("{}{}", prefix, message);
    let hash = keccak256(prefixed_message.as_bytes());
    
    // Sign the hash (recoverable signature)
    let message_obj = Message::from_digest_slice(&hash)?;
    let secp = Secp256k1::new();
    let recoverable_sig = secp.sign_ecdsa_recoverable(&message_obj, &secret_key);
    let (recovery_id, compact_sig) = recoverable_sig.serialize_compact();
    
    // Serialize signature - compact_sig is 64 bytes (32 r + 32 s)
    let mut sig_bytes = [0u8; 65];
    sig_bytes[0..32].copy_from_slice(&compact_sig[0..32]); // r
    sig_bytes[32..64].copy_from_slice(&compact_sig[32..64]); // s
    sig_bytes[64] = recovery_id.to_i32() as u8 + 27;
    
    Ok(format!("0x{}", hex::encode(sig_bytes)))
}

pub fn sign_typed_data(
    _wallet_id: String,
    _account_index: u32,
    typed_data_json: String,
) -> Result<String> {
    // TODO: Implement EIP-712 signing
    // For now, hash the JSON
    let hash = keccak256(typed_data_json.as_bytes());
    Ok(format!("0x{}", hex::encode(hash)))
}

pub fn recover_signer(message: String, signature: String) -> Result<String> {
    let signature = signature.trim_start_matches("0x");
    if signature.len() != 130 {
        return Err(CoreError::SigningError);
    }

    // Parse signature components
    let r = &signature[0..64];
    let s = &signature[64..128];
    let v = &signature[128..130];

    // TODO: Implement actual recovery
    Ok(format!("0x{}{}{}", r, s, v))
}

pub fn estimate_gas(params: EvmTxParams, rpc_url: String) -> Result<GasEstimate> {
    // Use RPC to estimate gas
    let client = crate::rpc::JsonRpcClient::new(rpc_url);

    let tx_obj = serde_json::json!({
        "from": params.from,
        "to": params.to,
        "value": params.value,
        "data": params.data.unwrap_or_else(|| "0x".to_string()),
    });

    let params_json = serde_json::json!([tx_obj, "latest"]).to_string();
    let response = client.call("eth_estimateGas".to_string(), params_json)?;

    let gas_hex = response.result.ok_or(CoreError::RpcError)?;

    let gas_hex = gas_hex.trim_matches('"').trim_start_matches("0x");
    let gas_limit = u64::from_str_radix(gas_hex, 16).map_err(|_| CoreError::RpcError)?;

    Ok(GasEstimate {
        gas_limit: gas_limit.to_string(),
        gas_price: params.gas_price.clone(),
        max_fee: params.gas_price.clone(),
        total_cost: (gas_limit as u128 * params.gas_price.parse::<u128>().unwrap_or(0)).to_string(),
    })
}

fn compute_tx_hash(params: &EvmTxParams) -> Result<[u8; 32]> {
    // Simplified hash computation
    let mut stream = RlpStream::new();
    stream.begin_list(9);
    stream.append(&params.nonce);
    stream.append(&params.gas_price.parse::<u64>().unwrap_or(0));
    stream.append(&params.gas_limit);
    stream.append(&params.to);
    stream.append(&params.value.parse::<u64>().unwrap_or(0));
    stream.append(&params.data.as_ref().map(|s| s.as_str()).unwrap_or("0x"));
    stream.append(&params.chain_id);
    stream.append(&0u8);
    stream.append(&0u8);

    let encoded = stream.out();
    Ok(keccak256(&encoded))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_transaction() {
        let params = EvmTxParams {
            from: "0x1234567890123456789012345678901234567890".to_string(),
            to: "0x0987654321098765432109876543210987654321".to_string(),
            value: "1000000000000000000".to_string(),
            data: None,
            gas_limit: 21000,
            gas_price: "20000000000".to_string(),
            nonce: 0,
            chain_id: 1,
        };

        let tx = build_transaction(params).unwrap();
        assert!(tx.hash.starts_with("0x"));
    }
}
