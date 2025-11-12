package com.nor.wallet

import com.nor.core.NorCore

/** Service layer for wallet operations using Nor Core FFI */
object WalletService {

    init {
        // Initialize logger on first use
        NorCore.initLogger(NorCore.LogLevel.INFO)
    }

    // MARK: - Wallet Operations

    /** Create a new HD wallet */
    @Throws(WalletException::class)
    fun createWallet(): NorCore.WalletInfo {
        return NorCore.createWallet() ?: throw WalletException.CreationFailed()
    }

    /** Import wallet from mnemonic phrase */
    @Throws(WalletException::class)
    fun importWallet(mnemonic: String): NorCore.WalletInfo {
        if (mnemonic.isBlank()) {
            throw WalletException.InvalidMnemonic()
        }

        return NorCore.importWallet(mnemonic) ?: throw WalletException.ImportFailed()
    }

    /** Import wallet from private key */
    @Throws(WalletException::class)
    fun importWallet(privateKey: String): NorCore.WalletInfo {
        if (privateKey.isBlank()) {
            throw WalletException.InvalidPrivateKey()
        }

        return NorCore.importWallet(privateKey) ?: throw WalletException.ImportFailed()
    }

    // MARK: - Chain Configuration

    /** Get current chain RPC URL */
    val chainRpcUrl: String
        get() = NorCore.chainRpcUrl

    /** Get current chain ID */
    val chainId: Long
        get() = NorCore.chainId

    /** Get chain information */
    fun getChainInfo(): ChainInfo {
        return ChainInfo(
                name = "Nor Chain",
                rpcUrl = chainRpcUrl,
                chainId = chainId,
                symbol = "NOR",
                explorerUrl = "https://explorer.norchain.org"
        )
    }

    // MARK: - Transaction Operations

    /** Sign a transaction */
    @Throws(WalletException::class)
    fun signTransaction(
            from: String,
            to: String,
            value: String,
            gasPrice: String,
            nonce: Long,
            data: String = "0x"
    ): String {
        return NorCore.signTransaction(
                from = from,
                to = to,
                value = value,
                data = data,
                gasLimit = 21000,
                gasPrice = gasPrice,
                nonce = nonce,
                chainId = chainId
        )
                ?: throw WalletException.TransactionSigningFailed()
    }

    /** Get account balance */
    @Throws(WalletException::class)
    fun getBalance(address: String): String {
        return NorCore.getBalance(address = address, rpcUrl = chainRpcUrl)
                ?: throw WalletException.BalanceQueryFailed()
    }
}

// MARK: - Supporting Types

data class ChainInfo(
        val name: String,
        val rpcUrl: String,
        val chainId: Long,
        val symbol: String,
        val explorerUrl: String
)

sealed class WalletException(message: String) : Exception(message) {
    class CreationFailed : WalletException("Failed to create wallet")
    class ImportFailed : WalletException("Failed to import wallet")
    class InvalidMnemonic : WalletException("Invalid mnemonic phrase")
    class InvalidPrivateKey : WalletException("Invalid private key")
    class TransactionSigningFailed : WalletException("Failed to sign transaction")
    class BalanceQueryFailed : WalletException("Failed to query balance")
}
