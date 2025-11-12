package com.nor.core

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.security.SecureRandom
import java.util.Date

/**
 * Kotlin wrapper around the Rust core wallet manager
 * Provides a nicer API with Kotlin conveniences
 */
class NorWallet {
    private val walletManager: WalletManager = WalletManager()

    // MARK: - Wallet Creation

    /**
     * Create a new wallet with random entropy
     */
    suspend fun createWallet(passphrase: String? = null): WalletInfo = withContext(Dispatchers.IO) {
        val entropy = generateEntropy()
        val wallet = walletManager.createWallet(entropy.toList(), passphrase)
        WalletInfo.from(wallet)
    }

    /**
     * Import wallet from mnemonic phrase
     */
    suspend fun importWallet(mnemonic: String, passphrase: String? = null): WalletInfo =
        withContext(Dispatchers.IO) {
            val wallet = walletManager.importFromMnemonic(mnemonic, passphrase)
            WalletInfo.from(wallet)
        }

    /**
     * Import wallet from private key
     */
    suspend fun importWallet(privateKey: String): WalletInfo = withContext(Dispatchers.IO) {
        val wallet = walletManager.importFromPrivateKey(privateKey)
        WalletInfo.from(wallet)
    }

    // MARK: - Account Management

    /**
     * Derive accounts for a wallet
     */
    suspend fun deriveAccounts(
        walletId: String,
        startIndex: UInt = 0u,
        count: UInt = 1u
    ): List<AccountInfo> = withContext(Dispatchers.IO) {
        val accounts = walletManager.deriveAccounts(walletId, startIndex, count)
        accounts.map { AccountInfo.from(it) }
    }

    /**
     * Derive a single account
     */
    suspend fun deriveAccount(walletId: String, index: UInt): AccountInfo =
        withContext(Dispatchers.IO) {
            val account = walletManager.deriveAccount(walletId, index)
            AccountInfo.from(account)
        }

    // MARK: - Export

    /**
     * Export mnemonic for backup (requires authentication)
     */
    suspend fun exportMnemonic(walletId: String): String = withContext(Dispatchers.IO) {
        walletManager.exportMnemonic(walletId)
    }

    /**
     * Export private key for specific account (requires authentication)
     */
    suspend fun exportPrivateKey(walletId: String, accountIndex: UInt): String =
        withContext(Dispatchers.IO) {
            walletManager.exportPrivateKey(walletId, accountIndex)
        }

    // MARK: - Helpers

    private fun generateEntropy(): ByteArray {
        val bytes = ByteArray(32)
        SecureRandom().nextBytes(bytes)
        return bytes
    }
}

// MARK: - Kotlin-friendly Models

data class WalletInfo(
    val id: String,
    val accounts: List<AccountInfo>,
    val createdAt: Date
) {
    companion object {
        fun from(wallet: Wallet): WalletInfo {
            return WalletInfo(
                id = wallet.id,
                accounts = wallet.accounts.map { AccountInfo.from(it) },
                createdAt = Date(wallet.createdAt.toLong())
            )
        }
    }
}

data class AccountInfo(
    val address: String,
    val publicKey: String,
    val index: UInt,
    val derivationPath: String
) {
    companion object {
        fun from(account: Account): AccountInfo {
            return AccountInfo(
                address = account.address,
                publicKey = account.publicKey,
                index = account.index,
                derivationPath = account.derivationPath
            )
        }
    }
}

// MARK: - Error Extensions

/**
 * Convert CoreError to localized message
 */
fun CoreError.toMessage(): String {
    return when (this) {
        is CoreError.InvalidMnemonic -> "Invalid mnemonic phrase"
        is CoreError.InvalidPrivateKey -> "Invalid private key"
        is CoreError.InvalidAddress -> "Invalid address"
        is CoreError.InvalidTransaction -> "Invalid transaction"
        is CoreError.SigningError -> "Failed to sign"
        is CoreError.RpcError -> "RPC request failed"
        is CoreError.NetworkError -> "Network error"
        is CoreError.InvalidInput -> "Invalid input"
        is CoreError.InternalError -> "Internal error"
    }
}
