use bip32::{DerivationPath, ExtendedPrivateKey, XPrv};
use bip39::{Language, Mnemonic};
use k256::ecdsa::SigningKey;
use secp256k1::{PublicKey, Secp256k1, SecretKey};
use std::str::FromStr;
use tiny_keccak::{Hasher, Keccak};
use zeroize::Zeroize;

use crate::{error::*, types::*};

const DEFAULT_DERIVATION_PATH: &str = "m/44'/60'/0'/0";

#[derive(Clone)]
pub struct Wallet {
    pub id: String,
    mnemonic: Option<String>,
    master_key: ExtendedPrivateKey<SigningKey>,
    accounts: Vec<DerivedAccount>,
}

#[derive(Clone)]
struct DerivedAccount {
    index: u32,
    secret_key: SecretKey,
    public_key: PublicKey,
    address: String,
    derivation_path: String,
}

impl Wallet {
    /// Create a new wallet from entropy
    pub fn from_entropy(entropy: &[u8], passphrase: Option<&str>) -> Result<Self> {
        let mnemonic = Mnemonic::from_entropy(entropy)?;
        Self::from_mnemonic_internal(mnemonic, passphrase)
    }

    /// Create wallet from mnemonic phrase
    pub fn from_mnemonic(mnemonic_str: &str, passphrase: Option<&str>) -> Result<Self> {
        let mnemonic = Mnemonic::parse_in(Language::English, mnemonic_str)?;
        Self::from_mnemonic_internal(mnemonic, passphrase)
    }

    fn from_mnemonic_internal(mnemonic: Mnemonic, passphrase: Option<&str>) -> Result<Self> {
        let seed = mnemonic.to_seed(passphrase.unwrap_or(""));
        let master_key = XPrv::new(&seed).map_err(|_| CoreError::InternalError)?;

        let id = uuid::Uuid::new_v4().to_string();

        let mut wallet = Self {
            id,
            mnemonic: Some(mnemonic.to_string()),
            master_key,
            accounts: Vec::new(),
        };

        // Derive first account by default
        wallet.derive_account_internal(0)?;

        Ok(wallet)
    }

    /// Create wallet from a single private key (no mnemonic)
    pub fn from_private_key(private_key_hex: &str) -> Result<Self> {
        let private_key_hex = private_key_hex.trim_start_matches("0x");
        let secret_bytes =
            hex::decode(private_key_hex).map_err(|_| CoreError::InvalidPrivateKey)?;

        let secret_key = SecretKey::from_slice(&secret_bytes)?;
        let secp = Secp256k1::new();
        let public_key = PublicKey::from_secret_key(&secp, &secret_key);
        let address = public_key_to_address(&public_key);

        let account = DerivedAccount {
            index: 0,
            secret_key,
            public_key,
            address,
            derivation_path: "imported".to_string(),
        };

        // Create a dummy master key (won't be used for imported keys)
        let mut seed_bytes = [0u8; 64];
        rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut seed_bytes);
        let master_key = XPrv::new(&seed_bytes).map_err(|_| CoreError::InternalError)?;

        Ok(Self {
            id: uuid::Uuid::new_v4().to_string(),
            mnemonic: None,
            master_key,
            accounts: vec![account],
        })
    }

    /// Export mnemonic (if available)
    pub fn export_mnemonic(&self) -> Result<String> {
        self.mnemonic.clone().ok_or(CoreError::InvalidInput)
    }

    /// Export private key for specific account
    pub fn export_private_key(&self, account_index: u32) -> Result<String> {
        let account = self
            .accounts
            .iter()
            .find(|a| a.index == account_index)
            .ok_or(CoreError::InvalidInput)?;

        Ok(format!(
            "0x{}",
            hex::encode(account.secret_key.secret_bytes())
        ))
    }

    /// Derive a new account
    pub fn derive_account(&mut self, index: u32) -> Result<Account> {
        // Check if already derived
        if let Some(existing) = self.accounts.iter().find(|a| a.index == index) {
            return Ok(Account {
                address: existing.address.clone(),
                public_key: format!("0x{}", hex::encode(existing.public_key.serialize())),
                index,
                derivation_path: existing.derivation_path.clone(),
            });
        }

        self.derive_account_internal(index)
    }

    fn derive_account_internal(&mut self, index: u32) -> Result<Account> {
        let path = format!("{}/{}", DEFAULT_DERIVATION_PATH, index);
        let derivation_path =
            DerivationPath::from_str(&path).map_err(|_| CoreError::InternalError)?;

        let derived_key =
            derivation_path
                .iter()
                .try_fold(self.master_key.clone(), |key, child_index| {
                    key.derive_child(child_index.clone())
                        .map_err(|_| CoreError::InternalError)
                })?;

        // Convert k256::SigningKey to secp256k1::SecretKey
        let k256_private_key = derived_key.private_key();
        let secret_bytes = k256_private_key.to_bytes();
        let secret_key =
            SecretKey::from_slice(&secret_bytes).map_err(|_| CoreError::InternalError)?;

        let secp = Secp256k1::new();
        let public_key = PublicKey::from_secret_key(&secp, &secret_key);
        let address = public_key_to_address(&public_key);

        let account = DerivedAccount {
            index,
            secret_key,
            public_key,
            address: address.clone(),
            derivation_path: path.clone(),
        };

        self.accounts.push(account);

        Ok(Account {
            address,
            public_key: format!("0x{}", hex::encode(public_key.serialize())),
            index,
            derivation_path: path,
        })
    }

    /// Convert to public Wallet type
    pub fn to_wallet_data(&self) -> crate::types::Wallet {
        let accounts = self
            .accounts
            .iter()
            .map(|a| Account {
                address: a.address.clone(),
                public_key: format!("0x{}", hex::encode(a.public_key.serialize())),
                index: a.index,
                derivation_path: a.derivation_path.clone(),
            })
            .collect();

        crate::types::Wallet {
            id: self.id.clone(),
            accounts,
            created_at: std::time::SystemTime::now(),
        }
    }

    /// Get secret key for account (for signing)
    pub fn get_secret_key(&self, account_index: u32) -> Result<SecretKey> {
        self.accounts
            .iter()
            .find(|a| a.index == account_index)
            .map(|a| a.secret_key)
            .ok_or(CoreError::InvalidInput)
    }
}

impl Drop for Wallet {
    fn drop(&mut self) {
        // Zeroize sensitive data
        if let Some(ref mut mnemonic) = self.mnemonic {
            mnemonic.zeroize();
        }
        for account in &mut self.accounts {
            account.secret_key.non_secure_erase();
        }
    }
}

/// Convert public key to Ethereum address
fn public_key_to_address(public_key: &PublicKey) -> String {
    let public_key_bytes = &public_key.serialize_uncompressed()[1..]; // Remove 0x04 prefix

    let mut hasher = Keccak::v256();
    let mut hash = [0u8; 32];
    hasher.update(public_key_bytes);
    hasher.finalize(&mut hash);

    format!("0x{}", hex::encode(&hash[12..]))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wallet_from_entropy() {
        let entropy = [0u8; 16];
        let wallet = Wallet::from_entropy(&entropy, None).unwrap();
        assert!(!wallet.id.is_empty());
        assert_eq!(wallet.accounts.len(), 1);
    }

    #[test]
    fn test_wallet_from_mnemonic() {
        let mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
        let wallet = Wallet::from_mnemonic(mnemonic, None).unwrap();

        // Known address for this mnemonic
        assert_eq!(
            wallet.accounts[0].address.to_lowercase(),
            "0x9858effd232b4033e47d90003d41ec34ecaeda94"
        );
    }

    #[test]
    fn test_derive_multiple_accounts() {
        let entropy = [1u8; 16];
        let mut wallet = Wallet::from_entropy(&entropy, None).unwrap();

        let account1 = wallet.derive_account(1).unwrap();
        let account2 = wallet.derive_account(2).unwrap();

        assert_ne!(account1.address, account2.address);
        assert_eq!(wallet.accounts.len(), 3); // 0, 1, 2
    }
}
