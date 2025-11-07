// Network configuration for Nor Wallet

pub const NOR_CHAIN_RPC_URL: &str = "https://rpc.norchain.org";
pub const NOR_CHAIN_ID: u64 = 65001;
pub const NOR_CHAIN_NAME: &str = "Nor Chain";
pub const NOR_CHAIN_SYMBOL: &str = "NOR";
pub const NOR_CHAIN_DECIMALS: u8 = 18;

// Explorer URLs
pub const NOR_CHAIN_EXPLORER: &str = "https://explorer.norchain.org";

// Default gas configuration
pub const DEFAULT_GAS_LIMIT: u64 = 21000;
pub const DEFAULT_GAS_PRICE: &str = "20000000000"; // 20 Gwei

// Network configuration
#[derive(Debug, Clone)]
pub struct NetworkConfig {
    pub rpc_url: String,
    pub chain_id: u64,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub explorer_url: String,
}

impl NetworkConfig {
    pub fn nor_chain() -> Self {
        Self {
            rpc_url: NOR_CHAIN_RPC_URL.to_string(),
            chain_id: NOR_CHAIN_ID,
            name: NOR_CHAIN_NAME.to_string(),
            symbol: NOR_CHAIN_SYMBOL.to_string(),
            decimals: NOR_CHAIN_DECIMALS,
            explorer_url: NOR_CHAIN_EXPLORER.to_string(),
        }
    }

    pub fn default() -> Self {
        Self::nor_chain()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_network_is_nor_chain() {
        let config = NetworkConfig::default();
        assert_eq!(config.rpc_url, NOR_CHAIN_RPC_URL);
        assert_eq!(config.chain_id, NOR_CHAIN_ID);
    }
}
