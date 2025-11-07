//
//  ApiClient.swift
//  NorWallet
//
//  API Client for Unified API
//  Connects to NorChain Unified API for wallet operations
//

import Foundation

struct ApiClient {
    static let shared = ApiClient()
    
    private let baseUrl: String
    
    private init() {
        // Get API URL from Info.plist or use default
        if let apiUrl = Bundle.main.infoDictionary?["API_URL"] as? String {
            self.baseUrl = apiUrl
        } else {
            self.baseUrl = "http://localhost:4000"
        }
    }
    
    // MARK: - Response Models
    
    struct ApiResponse<T: Codable>: Codable {
        let success: Bool
        let data: T?
        let error: String?
        let message: String?
    }
    
    struct BalanceResponse: Codable {
        let balance: String
    }
    
    struct TransactionResponse: Codable {
        let hash: String
        let from: String
        let to: String
        let value: String
        let timestamp: Int64
        let status: String
    }
    
    struct AccountInfo: Codable {
        let address: String
        let balance: String
        let transactionCount: Int64
    }
    
    struct HealthResponse: Codable {
        let status: String
        let timestamp: String
    }
    
    // MARK: - Request Helper
    
    private func request<T: Codable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil
    ) async throws -> ApiResponse<T> {
        guard let url = URL(string: "\(baseUrl)/api/v1\(endpoint)") else {
            throw ApiError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 10.0
        
        if let body = body {
            request.httpBody = body
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw ApiError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw ApiError.httpError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode(ApiResponse<T>.self, from: data)
    }
    
    // MARK: - API Methods
    
    /// Get wallet balance
    func getBalance(address: String) async throws -> String {
        let response: ApiResponse<BalanceResponse> = try await request(endpoint: "/account/\(address)/balance")
        guard let balance = response.data?.balance else {
            throw ApiError.noData
        }
        return balance
    }
    
    /// Get wallet transactions
    func getTransactions(address: String, limit: Int = 50) async throws -> [TransactionResponse] {
        let response: ApiResponse<[TransactionResponse]> = try await request(
            endpoint: "/account/\(address)/transactions?limit=\(limit)"
        )
        return response.data ?? []
    }
    
    /// Get transaction details
    func getTransaction(txHash: String) async throws -> TransactionResponse {
        let response: ApiResponse<TransactionResponse> = try await request(endpoint: "/transaction/\(txHash)")
        guard let transaction = response.data else {
            throw ApiError.noData
        }
        return transaction
    }
    
    /// Get account information
    func getAccountInfo(address: String) async throws -> AccountInfo {
        let response: ApiResponse<AccountInfo> = try await request(endpoint: "/account/\(address)")
        guard let account = response.data else {
            throw ApiError.noData
        }
        return account
    }
    
    /// Health check
    func healthCheck() async throws -> HealthResponse {
        let response: ApiResponse<HealthResponse> = try await request(endpoint: "/health")
        return response.data ?? HealthResponse(status: "unknown", timestamp: "")
    }
}

// MARK: - API Errors

enum ApiError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case noData
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid API URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .noData:
            return "No data received"
        case .decodingError:
            return "Failed to decode response"
        }
    }
}

