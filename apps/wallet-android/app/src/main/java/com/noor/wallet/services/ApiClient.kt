package com.noor.wallet.services

import com.noor.wallet.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URL

/**
 * API Client for Unified API
 * Connects to NorChain Unified API for wallet operations
 */
class ApiClient {
    companion object {
        private val instance: ApiClient by lazy { ApiClient() }
        fun getInstance(): ApiClient = instance
    }

    private val baseUrl: String = BuildConfig.API_URL
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    @Serializable
    data class ApiResponse<T>(
        val success: Boolean,
        val data: T? = null,
        val error: String? = null,
        val message: String? = null
    )

    @Serializable
    data class BalanceResponse(
        val balance: String
    )

    @Serializable
    data class TransactionResponse(
        val hash: String,
        val from: String,
        val to: String,
        val value: String,
        val timestamp: Long,
        val status: String
    )

    @Serializable
    data class AccountInfo(
        val address: String,
        val balance: String,
        val transactionCount: Long
    )

    @Serializable
    data class HealthResponse(
        val status: String,
        val timestamp: String
    )

    /**
     * Make HTTP request to API
     */
    private suspend fun <T> request(
        endpoint: String,
        method: String = "GET",
        body: String? = null
    ): Result<ApiResponse<T>> = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/api/v1$endpoint")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = method
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Accept", "application/json")
            connection.connectTimeout = 10000
            connection.readTimeout = 10000

            // Send body if provided
            body?.let {
                connection.doOutput = true
                connection.outputStream.use { output ->
                    output.write(it.toByteArray())
                }
            }

            val responseCode = connection.responseCode
            val responseBody = if (responseCode == HttpURLConnection.HTTP_OK) {
                connection.inputStream.bufferedReader().use { it.readText() }
            } else {
                connection.errorStream?.bufferedReader()?.use { it.readText() } ?: ""
            }

            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = json.decodeFromString<ApiResponse<T>>(responseBody)
                Result.success(response)
            } else {
                Result.failure(Exception("HTTP $responseCode: $responseBody"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get wallet balance
     */
    suspend fun getBalance(address: String): Result<String> {
        return request<BalanceResponse>("/account/$address/balance").map { response ->
            response.data?.balance ?: "0"
        }
    }

    /**
     * Get wallet transactions
     */
    suspend fun getTransactions(address: String, limit: Int = 50): Result<List<TransactionResponse>> {
        return request<List<TransactionResponse>>("/account/$address/transactions?limit=$limit").map { response ->
            response.data ?: emptyList()
        }
    }

    /**
     * Get transaction details
     */
    suspend fun getTransaction(txHash: String): Result<TransactionResponse> {
        return request<TransactionResponse>("/transaction/$txHash").map { response ->
            response.data ?: throw Exception("Transaction not found")
        }
    }

    /**
     * Get account information
     */
    suspend fun getAccountInfo(address: String): Result<AccountInfo> {
        return request<AccountInfo>("/account/$address").map { response ->
            response.data ?: throw Exception("Account not found")
        }
    }

    /**
     * Health check
     */
    suspend fun healthCheck(): Result<HealthResponse> {
        return request<HealthResponse>("/health").map { response ->
            response.data ?: HealthResponse("unknown", "")
        }
    }
}

