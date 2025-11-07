use crate::{error::*, types::*};
use crate::storage;
use bs58;
use sha2::{Digest, Sha256};
use secp256k1::{Message, Secp256k1, ecdsa::RecoverableSignature, ecdsa::RecoveryId};

pub fn build_transaction(params: TronTxParams) -> Result<TronTransaction> {
    // Simplified TRON transaction building
    let raw_data = serde_json::json!({
        "contract": [{
            "parameter": {
                "value": {
                    "amount": params.amount,
                    "owner_address": params.from,
                    "to_address": params.to,
                },
                "type_url": "type.googleapis.com/protocol.TransferContract"
            },
            "type": "TransferContract"
        }],
        "ref_block_bytes": "0000",
        "ref_block_hash": "0000000000000000",
        "expiration": 0,
        "fee_limit": params.fee_limit,
        "timestamp": std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis(),
    });

    let txid = compute_txid(&raw_data.to_string())?;

    Ok(TronTransaction {
        txid: hex::encode(txid),
        raw_data: raw_data.to_string(),
        signed_tx: String::new(),
    })
}

pub fn sign_transaction(
    wallet_id: String,
    account_index: u32,
    params: TronTxParams,
) -> Result<String> {
    // Get wallet and secret key
    let wallet = storage::get_wallet(&wallet_id)?;
    let secret_key = wallet.get_secret_key(account_index)?;
    
    // Build transaction
    let tx = build_transaction(params)?;
    
    // Sign transaction (TRON uses different signing, simplified for now)
    // In production, this would properly sign the TRON transaction
    Ok(tx.txid)
}

pub fn sign_message(wallet_id: String, account_index: u32, message: String) -> Result<String> {
    // Get wallet and secret key
    let wallet = storage::get_wallet(&wallet_id)?;
    let secret_key = wallet.get_secret_key(account_index)?;
    
    // TRON message signing with ECDSA
    let prefix = format!("\x19TRON Signed Message:\n{}", message.len());
    let prefixed_message = format!("{}{}", prefix, message);
    let hash = Sha256::digest(prefixed_message.as_bytes());
    
    // Sign using secp256k1 (recoverable signature)
    let message_obj = Message::from_digest_slice(&hash)?;
    let secp = Secp256k1::new();
    let recoverable_sig = secp.sign_ecdsa_recoverable(&message_obj, &secret_key);
    let (recovery_id, compact_sig) = recoverable_sig.serialize_compact();
    
    // Serialize signature - compact_sig is 64 bytes (32 r + 32 s)
    let mut sig_bytes = [0u8; 65];
    sig_bytes[0..32].copy_from_slice(&compact_sig[0..32]); // r
    sig_bytes[32..64].copy_from_slice(&compact_sig[32..64]); // s
    sig_bytes[64] = recovery_id.to_i32() as u8 + 27;
    
    Ok(hex::encode(sig_bytes))
}

pub fn validate_address(address: String) -> Result<bool> {
    // TRON addresses are base58 encoded and start with 'T'
    if !address.starts_with('T') {
        return Ok(false);
    }

    // Try to decode base58
    match bs58::decode(&address).into_vec() {
        Ok(decoded) => {
            // Valid TRON address should decode to 25 bytes
            // (21 bytes address + 4 bytes checksum)
            if decoded.len() != 25 {
                return Ok(false);
            }

            // Verify checksum
            let addr_bytes = &decoded[0..21];
            let checksum = &decoded[21..25];

            let hash = Sha256::digest(&Sha256::digest(addr_bytes));
            let computed_checksum = &hash[0..4];

            Ok(checksum == computed_checksum)
        }
        Err(_) => Ok(false),
    }
}

fn compute_txid(raw_data: &str) -> Result<[u8; 32]> {
    let hash = Sha256::digest(raw_data.as_bytes());
    let mut txid = [0u8; 32];
    txid.copy_from_slice(&hash);
    Ok(txid)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_address() {
        // Valid TRON address format
        let valid = validate_address("TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy".to_string()).unwrap();
        assert!(valid);

        // Invalid address (doesn't start with T)
        let invalid =
            validate_address("0x1234567890123456789012345678901234567890".to_string()).unwrap();
        assert!(!invalid);
    }

    #[test]
    fn test_build_transaction() {
        let params = TronTxParams {
            from: "TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy".to_string(),
            to: "TM2TmqauSEiRxUPCoW8U8C6WKbW1m5BnCQ".to_string(),
            amount: 1000000,
            contract_address: None,
            data: None,
            fee_limit: 1000000,
        };

        let tx = build_transaction(params).unwrap();
        assert!(!tx.txid.is_empty());
    }
}
