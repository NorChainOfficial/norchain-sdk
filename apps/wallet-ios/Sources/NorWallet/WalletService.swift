import Foundation
import NorCore

/// Service layer for wallet operations using Nor Core FFI
public final class WalletService: @unchecked Sendable {
    
    public static let shared = WalletService()
    
    private init() {
        // Initialize logger on first use
        NorCore.initLogger(level: .info)
    }
    
    // MARK: - Wallet Operations
    
    /// Create a new HD wallet
    public func createWallet() throws -> WalletInfo {
        guard let wallet = NorCore.createWallet() else {
            throw WalletError.creationFailed
        }
        return wallet
    }
    
    /// Import wallet from mnemonic phrase
    public func importWallet(mnemonic: String) throws -> WalletInfo {
        guard !mnemonic.isEmpty else {
            throw WalletError.invalidMnemonic
        }
        
        guard let wallet = NorCore.importWallet(mnemonic: mnemonic) else {
            throw WalletError.importFailed
        }
        
        return wallet
    }
    
    /// Import wallet from private key
    public func importWallet(privateKey: String) throws -> WalletInfo {
        guard !privateKey.isEmpty else {
            throw WalletError.invalidPrivateKey
        }
        
        guard let wallet = NorCore.importWallet(privateKey: privateKey) else {
            throw WalletError.importFailed
        }
        
        return wallet
    }
    
    // MARK: - Chain Configuration
    
    /// Get current chain RPC URL
    public var chainRpcUrl: String {
        NorCore.chainRpcUrl
    }
    
    /// Get current chain ID
    public var chainId: UInt64 {
        NorCore.chainId
    }
    
    /// Get chain information
    public func getChainInfo() -> ChainInfo {
        ChainInfo(
            name: "Nor Chain",
            rpcUrl: chainRpcUrl,
            chainId: chainId,
            symbol: "NOR",
            explorerUrl: "https://explorer.norchain.org"
        )
    }
    
    // MARK: - Transaction Operations
    
    /// Sign a transaction
    public func signTransaction(
        from: String,
        to: String,
        value: String,
        gasPrice: String,
        nonce: UInt64,
        data: String = "0x"
    ) throws -> String {
        guard let txHash = NorCore.signTransaction(
            from: from,
            to: to,
            value: value,
            data: data,
            gasLimit: 21000,
            gasPrice: gasPrice,
            nonce: nonce,
            chainId: chainId
        ) else {
            throw WalletError.transactionSigningFailed
        }
        return txHash
    }
    
    /// Get account balance
    public func getBalance(address: String) throws -> String {
        guard let balance = NorCore.getBalance(
            address: address,
            rpcUrl: chainRpcUrl
        ) else {
            throw WalletError.balanceQueryFailed
        }
        return balance
    }
}

// MARK: - Supporting Types

public struct ChainInfo {
    public let name: String
    public let rpcUrl: String
    public let chainId: UInt64
    public let symbol: String
    public let explorerUrl: String
}

public enum WalletError: LocalizedError {
    case creationFailed
    case importFailed
    case invalidMnemonic
    case invalidPrivateKey
    case transactionSigningFailed
    case balanceQueryFailed
    
    public var errorDescription: String? {
        switch self {
        case .creationFailed:
            return "Failed to create wallet"
        case .importFailed:
            return "Failed to import wallet"
        case .invalidMnemonic:
            return "Invalid mnemonic phrase"
        case .invalidPrivateKey:
            return "Invalid private key"
        case .transactionSigningFailed:
            return "Failed to sign transaction"
        case .balanceQueryFailed:
            return "Failed to query balance"
        }
    }
}
