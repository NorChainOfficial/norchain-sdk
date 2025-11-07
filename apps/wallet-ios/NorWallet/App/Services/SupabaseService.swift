import Foundation
import Supabase

@MainActor
class SupabaseService: ObservableObject {
    static let shared = SupabaseService()
    
    private let supabase: SupabaseClient
    
    @Published var currentSession: Session?
    @Published var isAuthenticated: Bool = false
    
    private init() {
        // Use environment-aware configuration
        supabase = SupabaseClient(
            supabaseURL: SupabaseConfig.supabaseURL,
            supabaseKey: SupabaseConfig.supabaseKey
        )
        
        // Check existing session
        Task {
            await checkSession()
            await observeAuthChanges()
        }
    }
    
    // MARK: - Authentication
    
    func checkSession() async {
        do {
            let session = try await supabase.auth.session
            await MainActor.run {
                self.currentSession = session
                self.isAuthenticated = true
            }
        } catch {
            await MainActor.run {
                self.currentSession = nil
                self.isAuthenticated = false
            }
        }
    }
    
    func signUp(email: String, password: String) async throws -> Session {
        let response = try await supabase.auth.signUp(
            email: email,
            password: password
        )
        guard let session = response.session else {
            throw NSError(domain: "SupabaseService", code: -1, userInfo: [NSLocalizedDescriptionKey: "No session returned"])
        }
        await MainActor.run {
            self.currentSession = session
            self.isAuthenticated = true
        }
        return session
    }
    
    func signIn(email: String, password: String) async throws -> Session {
        let session = try await supabase.auth.signIn(
            email: email,
            password: password
        )
        await MainActor.run {
            self.currentSession = session
            self.isAuthenticated = true
        }
        return session
    }
    
    func signOut() async throws {
        try await supabase.auth.signOut()
        await MainActor.run {
            self.currentSession = nil
            self.isAuthenticated = false
        }
    }
    
    private func observeAuthChanges() async {
        for await state in await supabase.auth.authStateChanges {
            await MainActor.run {
                self.currentSession = state.session
                self.isAuthenticated = state.session != nil
            }
        }
    }
    
    // MARK: - Devices
    
    func registerDevice(platform: String, label: String, pushToken: String?) async throws -> Device {
        guard let userId = currentSession?.user.id else {
            throw NSError(domain: "SupabaseService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])
        }
        
        let device = Device(
            user_id: userId,
            platform: platform,
            device_label: label,
            push_token: pushToken,
            is_active: true
        )
        
        let response: Device = try await supabase
            .from("devices")
            .insert(device)
            .select()
            .single()
            .execute()
            .value
        
        return response
    }
    
    // MARK: - Accounts
    
    func createAccount(chain: String, address: String, type: String = "EOA", isDefault: Bool = false) async throws -> SupabaseAccount {
        guard let userId = currentSession?.user.id else {
            throw NSError(domain: "SupabaseService", code: 401)
        }
        
        let account = SupabaseAccount(
            user_id: userId,
            chain: chain,
            address: address,
            type: type,
            is_default: isDefault
        )
        
        let response: SupabaseAccount = try await supabase
            .from("accounts")
            .insert(account)
            .select()
            .single()
            .execute()
            .value
        
        return response
    }
    
    func fetchAccounts() async throws -> [SupabaseAccount] {
        guard let userId = currentSession?.user.id else {
            throw NSError(domain: "SupabaseService", code: 401)
        }
        
        let accounts: [SupabaseAccount] = try await supabase
            .from("accounts")
            .select()
            .eq("user_id", value: userId.uuidString)
            .execute()
            .value
        
        return accounts
    }
    
    // MARK: - Transaction History
    
    func fetchTransactions(chain: String? = nil, limit: Int = 50) async throws -> [TxRecord] {
        guard let userId = currentSession?.user.id else {
            throw NSError(domain: "SupabaseService", code: 401)
        }
        
        var query = supabase
            .from("tx_history")
            .select()
            .eq("user_id", value: userId.uuidString)
        
        if let chain = chain {
            query = query.eq("chain", value: chain)
        }
        
        let transactions: [TxRecord] = try await query
            .order("created_at", ascending: false)
            .limit(limit)
            .execute()
            .value
        
        return transactions
    }
    
    // MARK: - Jobs
    
    func fetchJobs(status: String? = nil) async throws -> [Job] {
        guard let userId = currentSession?.user.id else {
            throw NSError(domain: "SupabaseService", code: 401)
        }
        
        var query = supabase
            .from("jobs")
            .select()
            .eq("user_id", value: userId.uuidString)
        
        if let status = status {
            query = query.eq("status", value: status)
        }
        
        let jobs: [Job] = try await query
            .order("created_at", ascending: false)
            .execute()
            .value
        
        return jobs
    }
    
    // MARK: - Edge Functions
    
    func initiateBridge(
        fromChain: String,
        toChain: String,
        fromToken: String,
        toToken: String,
        amount: String
    ) async throws -> Job {
        guard let session = currentSession else {
            throw NSError(domain: "SupabaseService", code: 401)
        }
        
        let request: [String: AnyCodable] = [
            "from_chain": AnyCodable(fromChain),
            "to_chain": AnyCodable(toChain),
            "from_token": AnyCodable(fromToken),
            "to_token": AnyCodable(toToken),
            "amount": AnyCodable(amount)
        ]
        
        let encoder = JSONEncoder()
        let body = try encoder.encode(request)

        // Invoke Edge Function
        let response = try await supabase.functions
            .invoke("bridge-initiate", options: FunctionInvokeOptions(
                headers: ["Authorization": "Bearer \(session.accessToken)"],
                body: body
            ))

        // Parse response as Job
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601

        guard let data = response.data else {
            throw NSError(domain: "SupabaseService", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data in Edge Function response"])
        }

        let job = try decoder.decode(Job.self, from: data)
        return job
    }

    func sponsorPaymaster(
        userOperation: [String: Any],
        chain: String,
        accountId: String
    ) async throws -> PaymasterResponse {
        guard let session = currentSession else {
            throw NSError(domain: "SupabaseService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])
        }

        let request: [String: AnyCodable] = [
            "user_operation": AnyCodable(userOperation),
            "chain": AnyCodable(chain),
            "account_id": AnyCodable(accountId)
        ]

        let encoder = JSONEncoder()
        let body = try encoder.encode(request)

        // Invoke Edge Function
        let response = try await supabase.functions
            .invoke("paymaster-sponsor", options: FunctionInvokeOptions(
                headers: ["Authorization": "Bearer \(session.accessToken)"],
                body: body
            ))

        // Parse response
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        guard let data = response.data else {
            throw NSError(domain: "SupabaseService", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data in Edge Function response"])
        }

        let paymasterResponse = try decoder.decode(PaymasterResponse.self, from: data)
        return paymasterResponse
    }
}

// MARK: - Models

struct Device: Codable, Identifiable {
    let id: UUID
    let user_id: UUID
    let platform: String
    let device_label: String?
    let push_token: String?
    let is_active: Bool
    let created_at: Date
    
    init(user_id: UUID, platform: String, device_label: String?, push_token: String?, is_active: Bool) {
        self.id = UUID()
        self.user_id = user_id
        self.platform = platform
        self.device_label = device_label
        self.push_token = push_token
        self.is_active = is_active
        self.created_at = Date()
    }
}

struct SupabaseAccount: Codable, Identifiable {
    let id: UUID
    let user_id: UUID
    let chain: String
    let address: String
    let type: String
    let is_default: Bool
    let created_at: Date
    
    init(user_id: UUID, chain: String, address: String, type: String, is_default: Bool) {
        self.id = UUID()
        self.user_id = user_id
        self.chain = chain
        self.address = address
        self.type = type
        self.is_default = is_default
        self.created_at = Date()
    }
}

// Renamed to avoid conflict with Supabase's Transaction type
struct TxRecord: Codable, Identifiable {
    let id: Int64
    let user_id: UUID
    let chain: String
    let account_address: String
    let tx_hash: String
    let status: String
    let direction: String
    let asset: String
    let value: String?
    let created_at: Date
}

struct Job: Codable, Identifiable {
    let id: UUID
    let user_id: UUID
    let kind: String
    let request: [String: AnyCodable]
    let status: String
    let result: [String: AnyCodable]?
    let created_at: Date

    enum CodingKeys: String, CodingKey {
        case id, user_id, kind, request, status, result, created_at
    }
}

struct PaymasterResponse: Codable {
    let sponsored: Bool
    let paymasterAndData: String?
    let estimatedGas: String?
    let message: String?

    enum CodingKeys: String, CodingKey {
        case sponsored
        case paymasterAndData = "paymaster_and_data"
        case estimatedGas = "estimated_gas"
        case message
    }
}

// Helper for dynamic JSON encoding/decoding
struct AnyCodable: Codable {
    let value: Any
    
    init(_ value: Any) {
        self.value = value
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode AnyCodable")
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch value {
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: encoder.codingPath, debugDescription: "Cannot encode value"))
        }
    }
}

struct BridgeResponse: Codable {
    let ok: Bool
    let job: Job
}
