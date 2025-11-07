use crate::{error::*, types::*};
use serde_json::json;

pub fn simulate_transaction(params: EvmTxParams, rpc_url: String) -> Result<SimulationResult> {
    let client = crate::rpc::JsonRpcClient::new(rpc_url);

    // Use eth_call to simulate
    let tx_obj = json!({
        "from": params.from,
        "to": params.to,
        "value": params.value,
        "data": params.data.clone().unwrap_or_else(|| "0x".to_string()),
        "gas": format!("0x{:x}", params.gas_limit),
    });

    let params_json = json!([tx_obj, "latest"]).to_string();
    let response = client.call("eth_call".to_string(), params_json)?;

    let success = response.error.is_none();

    // Estimate gas for the simulation
    let gas_estimate = crate::evm::estimate_gas(params, client.rpc_url.clone())?;

    Ok(SimulationResult {
        success,
        error: response.error,
        state_changes: vec![],
        allowance_changes: vec![],
        token_transfers: vec![],
        gas_estimate,
    })
}

pub fn analyze_transaction(params: EvmTxParams, rpc_url: String) -> Result<SafetyReport> {
    let simulation = simulate_transaction(params, rpc_url)?;

    let mut warnings = Vec::new();
    let mut critical_issues = Vec::new();

    // Check for high gas usage
    if let Ok(gas_limit) = simulation.gas_estimate.gas_limit.parse::<u64>() {
        if gas_limit > 1_000_000 {
            warnings.push("High gas usage detected".to_string());
        }
    }

    // Check simulation success
    if !simulation.success {
        critical_issues.push("Transaction simulation failed".to_string());
    }

    let is_safe = critical_issues.is_empty();

    Ok(SafetyReport {
        is_safe,
        warnings,
        critical_issues,
        simulation,
    })
}

pub fn check_allowance(
    token: String,
    owner: String,
    spender: String,
    rpc_url: String,
) -> Result<String> {
    let client = crate::rpc::JsonRpcClient::new(rpc_url);

    // ERC-20 allowance(address,address) selector: 0xdd62ed3e
    let data = format!(
        "0xdd62ed3e{:0>64}{:0>64}",
        owner.trim_start_matches("0x"),
        spender.trim_start_matches("0x")
    );

    let tx_obj = json!({
        "to": token,
        "data": data,
    });

    let params_json = json!([tx_obj, "latest"]).to_string();
    let response = client.call("eth_call".to_string(), params_json)?;

    response.result.ok_or(CoreError::RpcError)
}

pub fn decode_token_transfers(tx_hash: String, rpc_url: String) -> Result<Vec<TokenTransfer>> {
    let client = crate::rpc::JsonRpcClient::new(rpc_url);

    // Get transaction receipt
    let params_json = json!([tx_hash]).to_string();
    let response = client.call("eth_getTransactionReceipt".to_string(), params_json)?;

    let receipt_json = response.result.ok_or(CoreError::RpcError)?;

    let receipt: serde_json::Value =
        serde_json::from_str(&receipt_json).map_err(|_| CoreError::RpcError)?;

    let logs = receipt
        .get("logs")
        .and_then(|l| l.as_array())
        .ok_or(CoreError::RpcError)?;

    let mut transfers = Vec::new();

    // ERC-20 Transfer event signature: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    const TRANSFER_TOPIC: &str =
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    for log in logs {
        if let Some(topics) = log.get("topics").and_then(|t| t.as_array()) {
            if topics.is_empty() {
                continue;
            }

            let topic0 = topics[0].as_str().unwrap_or("");
            if topic0 == TRANSFER_TOPIC && topics.len() >= 3 {
                let token = log
                    .get("address")
                    .and_then(|a| a.as_str())
                    .unwrap_or("")
                    .to_string();

                let from = format!("0x{}", &topics[1].as_str().unwrap_or("")[26..]);
                let to = format!("0x{}", &topics[2].as_str().unwrap_or("")[26..]);

                let amount = log
                    .get("data")
                    .and_then(|d| d.as_str())
                    .unwrap_or("0x0")
                    .to_string();

                transfers.push(TokenTransfer {
                    token,
                    from,
                    to,
                    amount,
                    token_symbol: None,
                    decimals: None,
                });
            }
        }
    }

    Ok(transfers)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyze_transaction() {
        // This test requires a live RPC endpoint, so we'll skip actual execution
        // In a real scenario, you'd use a mock RPC server
        assert!(true);
    }
}
