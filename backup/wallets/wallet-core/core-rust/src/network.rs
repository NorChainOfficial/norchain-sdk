// Network and RPC management

use crate::{config::NetworkConfig, error::*, rpc::JsonRpcClient};

pub struct NetworkManager {
    current_network: NetworkConfig,
    client: JsonRpcClient,
}

impl NetworkManager {
    pub fn new() -> Result<Self> {
        let network = NetworkConfig::default(); // Defaults to Noor Chain
        let client = JsonRpcClient::new(network.rpc_url.clone());

        Ok(Self {
            current_network: network,
            client,
        })
    }

    pub fn with_network(network: NetworkConfig) -> Result<Self> {
        let client = JsonRpcClient::new(network.rpc_url.clone());

        Ok(Self {
            current_network: network,
            client,
        })
    }

    pub fn get_network_info(&self) -> NetworkInfo {
        NetworkInfo {
            rpc_url: self.current_network.rpc_url.clone(),
            chain_id: self.current_network.chain_id,
            name: self.current_network.name.clone(),
            symbol: self.current_network.symbol.clone(),
            decimals: self.current_network.decimals,
            explorer_url: self.current_network.explorer_url.clone(),
        }
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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct NetworkInfo {
    pub rpc_url: String,
    pub chain_id: u64,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub explorer_url: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_network_is_noor_chain() {
        let manager = NetworkManager::new().unwrap();
        let info = manager.get_network_info();

        assert_eq!(info.rpc_url, "https://rpc.noorchain.org");
        assert_eq!(info.name, "Noor Chain");
    }
}
