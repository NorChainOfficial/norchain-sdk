package com.noor.wallet

import com.noor.core.NoorCore

/** Service layer for wallet operations using Noor Core FFI */
object WalletService {

    init {
        // Initialize logger on first use
        NoorCore.initLogger(NoorCore.LogLevel.INFO)
    }

    // MARK: - Wallet Operations

    /** Create a new HD wallet */
    @Throws(WalletException::class)
    fun createWallet(): NoorCore.WalletInfo {
        return NoorCore.createWallet() ?: throw WalletException.CreationFailed()
    }

    /** Import wallet from mnemonic phrase */
    @Throws(WalletException::class)
    fun importWallet(mnemonic: String): NoorCore.WalletInfo {
        if (mnemonic.isBlank()) {
            throw WalletException.InvalidMnemonic()
        }

        return NoorCore.importWallet(mnemonic) ?: throw WalletException.ImportFailed()
    }

    /** Import wallet from private key */
    @Throws(WalletException::class)
    fun importWallet(privateKey: String): NoorCore.WalletInfo {
        if (privateKey.isBlank()) {
            throw WalletException.InvalidPrivateKey()
        }

        return NoorCore.importWallet(privateKey) ?: throw WalletException.ImportFailed()
    }

    // MARK: - Chain Configuration

    /** Get current chain RPC URL */
    val chainRpcUrl: String
        get() = NoorCore.chainRpcUrl

    /** Get current chain ID */
    val chainId: Long
        get() = NoorCore.chainId

    /** Get chain information */
    fun getChainInfo(): ChainInfo {
        return ChainInfo(
                name = "Noor Chain",
                rpcUrl = chainRpcUrl,
                chainId = chainId,
                symbol = "NOR",
                explorerUrl = "https://explorer.noorchain.org"
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
        return NoorCore.signTransaction(
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
        return NoorCore.getBalance(address = address, rpcUrl = chainRpcUrl)
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
