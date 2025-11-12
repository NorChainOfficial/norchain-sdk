// Integration tests for Nor Wallet Core

use nor_core::{
    get_nor_chain_id, get_nor_chain_rpc, Account, EvmManager, NetworkManager, WalletManager,
};

#[test]
fn test_nor_chain_config() {
    let rpc_url = get_nor_chain_rpc();
    let chain_id = get_nor_chain_id();

    assert_eq!(rpc_url, "https://rpc.norchain.org");
    assert_eq!(chain_id, 7860);
}

#[test]
fn test_network_manager() {
    let manager = NetworkManager::new().unwrap();
    let info = manager.get_network_info();

    assert_eq!(info.rpc_url, "https://rpc.norchain.org");
    assert_eq!(info.chain_id, 7860);
    assert_eq!(info.name, "Nor Chain");
    assert_eq!(info.symbol, "NOR");
    assert_eq!(info.decimals, 18);
}

#[test]
fn test_wallet_creation() {
    let manager = WalletManager::new().unwrap();
    let entropy = vec![0u8; 32];

    let wallet = manager.create_wallet(entropy, None).unwrap();

    assert!(!wallet.id.is_empty());
    assert_eq!(wallet.accounts.len(), 1);
    assert!(wallet.accounts[0].address.starts_with("0x"));
}

#[test]
fn test_wallet_import_mnemonic() {
    let manager = WalletManager::new().unwrap();
    let mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    let wallet = manager
        .import_from_mnemonic(mnemonic.to_string(), None)
        .unwrap();

    assert!(!wallet.id.is_empty());
    assert_eq!(wallet.accounts.len(), 1);

    // Known address for this mnemonic
    assert_eq!(
        wallet.accounts[0].address.to_lowercase(),
        "0x9858effd232b4033e47d90003d41ec34ecaeda94"
    );
}

#[test]
fn test_derive_multiple_accounts() {
    let manager = WalletManager::new().unwrap();
    let entropy = vec![1u8; 32];

    let wallet = manager.create_wallet(entropy, None).unwrap();
    let wallet_id = wallet.id.clone();

    // Derive additional accounts
    let accounts = manager.derive_accounts(wallet_id.clone(), 1, 3).unwrap();

    assert_eq!(accounts.len(), 3);
    assert_eq!(accounts[0].index, 1);
    assert_eq!(accounts[1].index, 2);
    assert_eq!(accounts[2].index, 3);

    // All addresses should be unique
    let addr1 = &accounts[0].address;
    let addr2 = &accounts[1].address;
    let addr3 = &accounts[2].address;

    assert_ne!(addr1, addr2);
    assert_ne!(addr2, addr3);
    assert_ne!(addr1, addr3);
}

#[test]
fn test_export_mnemonic() {
    let manager = WalletManager::new().unwrap();
    let mnemonic = "test walk nut penalty hip pave soap entry language right filter choice";

    let wallet = manager
        .import_from_mnemonic(mnemonic.to_string(), None)
        .unwrap();
    let exported = manager.export_mnemonic(wallet.id.clone()).unwrap();

    assert_eq!(exported, mnemonic);
}

#[test]
fn test_evm_manager() {
    let manager = EvmManager::new().unwrap();
    assert!(true); // Manager created successfully
}

#[test]
fn test_wallet_from_private_key() {
    let manager = WalletManager::new().unwrap();
    let private_key = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    let wallet = manager
        .import_from_private_key(private_key.to_string())
        .unwrap();

    assert!(!wallet.id.is_empty());
    assert_eq!(wallet.accounts.len(), 1);
    assert!(wallet.accounts[0].address.starts_with("0x"));
    assert_eq!(wallet.accounts[0].derivation_path, "imported");
}

#[test]
fn test_export_private_key() {
    let manager = WalletManager::new().unwrap();
    let entropy = vec![2u8; 32];

    let wallet = manager.create_wallet(entropy, None).unwrap();
    let private_key = manager.export_private_key(wallet.id.clone(), 0).unwrap();

    assert!(private_key.starts_with("0x"));
    assert_eq!(private_key.len(), 66); // 0x + 64 hex chars
}
