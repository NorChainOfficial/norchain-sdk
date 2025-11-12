package com.nor.core

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName

/** Kotlin wrapper for Nor Core FFI */
object NorCore {

    init {
        System.loadLibrary("nor_core")
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
    private data class NorString(val ptr: Long, val len: Long)

    // MARK: - Native Methods

    private external fun norWalletCreate(): NorString
    private external fun norWalletFromMnemonic(mnemonic: String): NorString
    private external fun norWalletFromPrivateKey(privateKey: String): NorString
    private external fun norGetChainRpc(): NorString
    private external fun norGetChainId(): Long
    private external fun norStringFree(s: NorString)
    private external fun norInitLogger(level: Byte)
    private external fun norStringGetCString(ptr: Long): String
    private external fun norSignTransaction(
            fromAddress: String,
            toAddress: String,
            value: String,
            data: String,
            gasLimit: Long,
            gasPrice: String,
            nonce: Long,
            chainId: Long
    ): NorString
    private external fun norGetBalance(address: String, rpcUrl: String): NorString

    // MARK: - Public API

    private val gson = Gson()

    /** Create a new wallet with random entropy */
    fun createWallet(): WalletInfo? {
        val result = norWalletCreate()
        return try {
            val jsonString = norStringGetCString(result.ptr)
            norStringFree(result)
            gson.fromJson(jsonString, WalletInfo::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /** Import wallet from mnemonic phrase */
    fun importWallet(mnemonic: String): WalletInfo? {
        val result = norWalletFromMnemonic(mnemonic)
        return try {
            val jsonString = norStringGetCString(result.ptr)
            norStringFree(result)
            gson.fromJson(jsonString, WalletInfo::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /** Import wallet from private key */
    fun importWallet(privateKey: String): WalletInfo? {
        val result = norWalletFromPrivateKey(privateKey)
        return try {
            val jsonString = norStringGetCString(result.ptr)
            norStringFree(result)
            gson.fromJson(jsonString, WalletInfo::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /** Get Nor Chain RPC URL */
    val chainRpcUrl: String
        get() {
            val result = norGetChainRpc()
            return try {
                val url = norStringGetCString(result.ptr)
                norStringFree(result)
                url
            } catch (e: Exception) {
                ""
            }
        }

    /** Get Nor Chain ID */
    val chainId: Long
        get() = norGetChainId()

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
        norInitLogger(level.value)
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
        val result = norSignTransaction(from, to, value, data, gasLimit, gasPrice, nonce, chainId)
        return try {
            val txHash = norStringGetCString(result.ptr)
            norStringFree(result)
            txHash
        } catch (e: Exception) {
            null
        }
    }

    /** Get balance for an address */
    fun getBalance(address: String, rpcUrl: String): String? {
        val result = norGetBalance(address, rpcUrl)
        return try {
            val balance = norStringGetCString(result.ptr)
            norStringFree(result)
            balance
        } catch (e: Exception) {
            "0"
        }
    }
}
