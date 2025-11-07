package com.noor.core

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName

/** Kotlin wrapper for Noor Core FFI */
object NoorCore {

    init {
        System.loadLibrary("noor_core")
    }

    // MARK: - Data Models

    data class WalletInfo(
            val id: String,
            val accounts: List<Account>,
            @SerializedName("created_at") val createdAt: Long
    )

    data class Account(
            val index: Int,
            val address: String,
            @SerializedName("public_key") val publicKey: String,
            @SerializedName("chain_type") val chainType: String
    )

    // C-compatible string structure
    private data class NoorString(val ptr: Long, val len: Long)

    // MARK: - Native Methods

    private external fun noorWalletCreate(): NoorString
    private external fun noorWalletFromMnemonic(mnemonic: String): NoorString
    private external fun noorWalletFromPrivateKey(privateKey: String): NoorString
    private external fun noorGetChainRpc(): NoorString
    private external fun noorGetChainId(): Long
    private external fun noorStringFree(s: NoorString)
    private external fun noorInitLogger(level: Byte)
    private external fun noorStringGetCString(ptr: Long): String
    private external fun noorSignTransaction(
            fromAddress: String,
            toAddress: String,
            value: String,
            data: String,
            gasLimit: Long,
            gasPrice: String,
            nonce: Long,
            chainId: Long
    ): NoorString
    private external fun noorGetBalance(address: String, rpcUrl: String): NoorString

    // MARK: - Public API

    private val gson = Gson()

    /** Create a new wallet with random entropy */
    fun createWallet(): WalletInfo? {
        val result = noorWalletCreate()
        return try {
            val jsonString = noorStringGetCString(result.ptr)
            noorStringFree(result)
            gson.fromJson(jsonString, WalletInfo::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /** Import wallet from mnemonic phrase */
    fun importWallet(mnemonic: String): WalletInfo? {
        val result = noorWalletFromMnemonic(mnemonic)
        return try {
            val jsonString = noorStringGetCString(result.ptr)
            noorStringFree(result)
            gson.fromJson(jsonString, WalletInfo::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /** Import wallet from private key */
    fun importWallet(privateKey: String): WalletInfo? {
        val result = noorWalletFromPrivateKey(privateKey)
        return try {
            val jsonString = noorStringGetCString(result.ptr)
            noorStringFree(result)
            gson.fromJson(jsonString, WalletInfo::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /** Get Noor Chain RPC URL */
    val chainRpcUrl: String
        get() {
            val result = noorGetChainRpc()
            return try {
                val url = noorStringGetCString(result.ptr)
                noorStringFree(result)
                url
            } catch (e: Exception) {
                ""
            }
        }

    /** Get Noor Chain ID */
    val chainId: Long
        get() = noorGetChainId()

    // MARK: - Logging

    enum class LogLevel(val value: Byte) {
        TRACE(0),
        DEBUG(1),
        INFO(2),
        WARN(3),
        ERROR(4)
    }

    /** Initialize logger with specified level */
    fun initLogger(level: LogLevel = LogLevel.INFO) {
        noorInitLogger(level.value)
    }

    // MARK: - Transaction Operations

    /** Sign an EVM transaction */
    fun signTransaction(
            from: String,
            to: String,
            value: String,
            data: String = "0x",
            gasLimit: Long = 21000,
            gasPrice: String,
            nonce: Long,
            chainId: Long
    ): String? {
        val result = noorSignTransaction(from, to, value, data, gasLimit, gasPrice, nonce, chainId)
        return try {
            val txHash = noorStringGetCString(result.ptr)
            noorStringFree(result)
            txHash
        } catch (e: Exception) {
            null
        }
    }

    /** Get balance for an address */
    fun getBalance(address: String, rpcUrl: String): String? {
        val result = noorGetBalance(address, rpcUrl)
        return try {
            val balance = noorStringGetCString(result.ptr)
            noorStringFree(result)
            balance
        } catch (e: Exception) {
            "0"
        }
    }
}
