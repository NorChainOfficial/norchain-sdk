// JSON-RPC client for blockchain communication
use crate::{error::*, types::*};
use reqwest::Client;
use serde_json::{json, Value};

pub struct JsonRpcClient {
    pub rpc_url: String,
    client: Client,
}

impl JsonRpcClient {
    pub fn new(rpc_url: String) -> Self {
        Self {
            rpc_url,
            client: Client::new(),
        }
    }

    pub fn call(&self, method: String, params_json: String) -> Result<RpcResponse> {
        let params: Value = serde_json::from_str(&params_json).unwrap_or(Value::Array(vec![]));

        let runtime = tokio::runtime::Runtime::new().map_err(|_| CoreError::InternalError)?;

        runtime.block_on(async {
            let body = json!({
                "jsonrpc": "2.0",
                "method": method,
                "params": params,
                "id": 1
            });

            let response = self.client.post(&self.rpc_url).json(&body).send().await?;

            let json: Value = response.json().await?;

            Ok(RpcResponse {
                result: json.get("result").map(|v| v.to_string()),
                error: json
                    .get("error")
                    .and_then(|e| e.get("message"))
                    .map(|m| m.to_string()),
                id: json.get("id").map(|v| v.to_string()),
            })
        })
    }

    pub fn batch_call(&self, requests: Vec<RpcRequest>) -> Result<Vec<RpcResponse>> {
        let runtime = tokio::runtime::Runtime::new().map_err(|_| CoreError::InternalError)?;

        runtime.block_on(async {
            let batch: Vec<Value> = requests
                .iter()
                .enumerate()
                .map(|(i, req)| {
                    let params: Value =
                        serde_json::from_str(&req.params).unwrap_or(Value::Array(vec![]));
                    json!({
                        "jsonrpc": "2.0",
                        "method": req.method,
                        "params": params,
                        "id": req.id.clone().unwrap_or_else(|| i.to_string())
                    })
                })
                .collect();

            let response = self.client.post(&self.rpc_url).json(&batch).send().await?;

            let json: Vec<Value> = response.json().await?;

            Ok(json
                .iter()
                .map(|v| RpcResponse {
                    result: v.get("result").map(|r| r.to_string()),
                    error: v
                        .get("error")
                        .and_then(|e| e.get("message"))
                        .map(|m| m.to_string()),
                    id: v.get("id").map(|i| i.to_string()),
                })
                .collect())
        })
    }

    pub fn get_balance(&self, address: String) -> Result<String> {
        let params = json!([address, "latest"]).to_string();
        let response = self.call("eth_getBalance".to_string(), params)?;

        response.result.ok_or(CoreError::RpcError)
    }

    pub fn get_nonce(&self, address: String) -> Result<u64> {
        let params = json!([address, "latest"]).to_string();
        let response = self.call("eth_getTransactionCount".to_string(), params)?;

        let nonce_hex = response.result.ok_or(CoreError::RpcError)?;

        let nonce_hex = nonce_hex.trim_matches('"').trim_start_matches("0x");
        u64::from_str_radix(nonce_hex, 16).map_err(|_| CoreError::RpcError)
    }

    pub fn get_chain_id(&self) -> Result<u64> {
        let response = self.call("eth_chainId".to_string(), "[]".to_string())?;

        let chain_id_hex = response.result.ok_or(CoreError::RpcError)?;

        let chain_id_hex = chain_id_hex.trim_matches('"').trim_start_matches("0x");
        u64::from_str_radix(chain_id_hex, 16).map_err(|_| CoreError::RpcError)
    }

    pub fn get_block_number(&self) -> Result<String> {
        let response = self.call("eth_blockNumber".to_string(), "[]".to_string())?;

        response.result.ok_or(CoreError::RpcError)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rpc_client_creation() {
        let client = JsonRpcClient::new("https://rpc.example.com".to_string());
        assert_eq!(client.rpc_url, "https://rpc.example.com");
    }
}
