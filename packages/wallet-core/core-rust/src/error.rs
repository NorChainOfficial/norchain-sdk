use thiserror::Error;

pub type Result<T> = std::result::Result<T, CoreError>;

// UniFFI error type defined in nor.udl
#[derive(Debug, Error)]
pub enum CoreError {
    #[error("Invalid mnemonic phrase")]
    InvalidMnemonic,

    #[error("Invalid private key")]
    InvalidPrivateKey,

    #[error("Invalid address")]
    InvalidAddress,

    #[error("Invalid transaction")]
    InvalidTransaction,

    #[error("Signing error")]
    SigningError,

    #[error("RPC error")]
    RpcError,

    #[error("Network error")]
    NetworkError,

    #[error("Invalid input")]
    InvalidInput,

    #[error("Internal error")]
    InternalError,
}

impl From<bip39::Error> for CoreError {
    fn from(_: bip39::Error) -> Self {
        CoreError::InvalidMnemonic
    }
}

impl From<secp256k1::Error> for CoreError {
    fn from(_: secp256k1::Error) -> Self {
        CoreError::SigningError
    }
}

impl From<reqwest::Error> for CoreError {
    fn from(_: reqwest::Error) -> Self {
        CoreError::NetworkError
    }
}

impl From<serde_json::Error> for CoreError {
    fn from(e: serde_json::Error) -> Self {
        CoreError::InvalidInput
    }
}
