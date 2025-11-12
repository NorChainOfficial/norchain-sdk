package com.nor.core

import java.util.Date
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// Nor Chain Network Configuration
object NorChainConfig {
    const val RPC_URL = "https://rpc.norchain.org"
    const val CHAIN_ID = 7860UL // Update with actual Nor Chain ID
    const val CHAIN_NAME = "Nor Chain"
    const val SYMBOL = "NOR"
    const val DECIMALS = 18
    const val EXPLORER_URL = "https://explorer.norchain.org"
}

/** Kotlin wrapper around the Rust EVM transaction manager */
class NorEvm {
    private val evmManager: EvmManager = EvmManager()

    // MARK: - Transaction Building

    /** Build an EVM transaction */
    suspend fun buildTransaction(params: EvmTransactionParams): TransactionInfo =
            withContext(Dispatchers.IO) {
                val rustParams = params.toRust()
                val tx = evmManager.buildTransaction(rustParams)
                TransactionInfo.from(tx)
            }

    /** Sign an EVM transaction */
    suspend fun signTransaction(
            walletId: String,
            accountIndex: UInt,
            params: EvmTransactionParams
    ): String =
            withContext(Dispatchers.IO) {
                val rustParams = params.toRust()
                evmManager.signTransaction(walletId, accountIndex, rustParams)
            }

    // MARK: - Message Signing

    /** Sign a message (personal_sign) */
    suspend fun signMessage(walletId: String, accountIndex: UInt, message: String): String =
            withContext(Dispatchers.IO) { evmManager.signMessage(walletId, accountIndex, message) }

    /** Sign typed data (EIP-712) */
    suspend fun signTypedData(walletId: String, accountIndex: UInt, typedData: String): String =
            withContext(Dispatchers.IO) {
                evmManager.signTypedData(walletId, accountIndex, typedData)
            }

    /** Recover signer from signature */
    suspend fun recoverSigner(message: String, signature: String): String =
            withContext(Dispatchers.IO) { evmManager.recoverSigner(message, signature) }

    // MARK: - Gas Estimation

    /** Estimate gas for transaction */
    suspend fun estimateGas(params: EvmTransactionParams, rpcUrl: String): GasEstimateInfo =
            withContext(Dispatchers.IO) {
                val rustParams = params.toRust()
                val estimate = evmManager.estimateGas(rustParams, rpcUrl)
                GasEstimateInfo.from(estimate)
            }
}

// MARK: - Kotlin-friendly Models

data class EvmTransactionParams(
        val from: String,
        val to: String,
        val value: String,
        val data: String? = null,
        val gasLimit: ULong,
        val gasPrice: String,
        val nonce: ULong,
        val chainId: ULong
) {
    fun toRust(): EvmTxParams {
        return EvmTxParams(
                from = from,
                to = to,
                value = value,
                data = data,
                gasLimit = gasLimit,
                gasPrice = gasPrice,
                nonce = nonce,
                chainId = chainId
        )
    }
}

data class TransactionInfo(
        val hash: String,
        val signedTx: String,
        val blockHash: String?,
        val blockNumber: ULong?,
        val timestamp: Date?
) {
    companion object {
        fun from(tx: EvmTransaction): TransactionInfo {
            return TransactionInfo(
                    hash = tx.hash,
                    signedTx = tx.signedTx,
                    blockHash = tx.blockHash,
                    blockNumber = tx.blockNumber,
                    timestamp = tx.timestamp?.let { Date(it.toLong()) }
            )
        }
    }
}

data class GasEstimateInfo(
        val gasLimit: String,
        val gasPrice: String,
        val maxFee: String,
        val totalCost: String
) {
    companion object {
        fun from(estimate: GasEstimate): GasEstimateInfo {
            return GasEstimateInfo(
                    gasLimit = estimate.gasLimit,
                    gasPrice = estimate.gasPrice,
                    maxFee = estimate.maxFee,
                    totalCost = estimate.totalCost
            )
        }
    }
}
