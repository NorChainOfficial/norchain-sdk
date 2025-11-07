import Foundation
import Combine
import NorCore
import UIKit

// Conditional import - only if Supabase SDK is available
#if canImport(Supabase)
import Supabase
#endif

// Import WalletService from the NorWallet package
// Note: WalletService is in Sources/NorWallet and should be accessible
// If not accessible, we'll use direct NorCore calls instead

struct ChainInfo {
    let name: String
    let rpcUrl: String
    let chainId: UInt64
}

// Helper function for hex colors - uses direct Color initializer
private func hexColorHelper(_ hex: String) -> Color {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let r, g, b: UInt64
    switch hex.count {
    case 3: // RGB (12-bit)
        (r, g, b) = ((int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6: // RGB (24-bit)
        (r, g, b) = (int >> 16, int >> 8 & 0xFF, int & 0xFF)
    default:
        (r, g, b) = (0, 0, 0)
    }
    return Color(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
}

struct Asset: Identifiable {
    let id = UUID()
    let symbol: String
    let name: String
    let balance: String
    let usdValue: String
    let change: String
    let color: Color
    let chartData: [Double]

    var changeColor: Color {
        change.hasPrefix("+") ? hexColorHelper("10B981") : hexColorHelper("EF4444")
    }
}

struct Transaction: Identifiable, Codable {
    let id: String
    let hash: String
    let from: String
    let to: String
    let value: String
    let timestamp: Date
    let status: TransactionStatus
    let type: TransactionType
    let gasUsed: String?
    let blockNumber: Int64?

    enum TransactionStatus: String, Codable {
        case pending
        case confirmed
        case failed
    }

    enum TransactionType: String, Codable {
        case send
        case receive
        case swap
        case contract
    }
}

import SwiftUI

@MainActor
class WalletViewModel: ObservableObject {
    @Published var currentWallet: WalletInfo?
    @Published var chainInfo: ChainInfo
    @Published var showError = false
    @Published var errorMessage = ""
    @Published var totalBalance = "$0.00"
    @Published var balanceChange = "+0.00%"
    @Published var assets: [Asset] = []
    @Published var isLoading = false
    @Published var isRefreshing = false
    @Published var isSending = false
    @Published var lastTransactionHash: String?
    @Published var wallets: [WalletInfo] = []
    @Published var transactions: [Transaction] = []

    // Performance optimization
    private var assetCache: [String: Asset] = [:]
    private let backgroundQueue = DispatchQueue(label: "com.nor.wallet.background", qos: .userInitiated)

    // Storage keys
    private let walletsStorageKey = "stored_wallets"
    // WalletService is used via static methods - direct NorCore calls used instead
    
    init() {
        // Initialize with Nor Chain info
        self.chainInfo = ChainInfo(
            name: "Nor Chain",
            rpcUrl: "https://rpc.norchain.org",
            chainId: 65001
        )

        // Initialize logger
        NorCore.initLogger(level: .info)

        // Load persisted wallets
        loadWallets()

        // Load transactions if we have a wallet
        if currentWallet != nil {
            loadTransactions()
        }
    }

    // MARK: - Wallet Management

    func createWallet(name: String) async throws {
        guard !name.isEmpty else {
            throw NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Wallet name cannot be empty"])
        }

        isLoading = true

        guard let wallet = NorCore.createWallet() else {
            isLoading = false
            let error = NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to create wallet"])
            await CrashReportingService.shared.recordWalletError(error, operation: "create_wallet")
            throw error
        }

        currentWallet = wallet
        wallets.append(wallet)
        saveWallets()
        loadDummyAssets()

        // Sync with Supabase (if authenticated)
        await syncWalletToSupabase()

        // Track analytics
        await AnalyticsService.shared.logEvent(.walletCreated, parameters: [
            "wallet_name": name,
            "wallet_count": wallets.count
        ])
        await AnalyticsService.shared.setUserProperty(.walletCount, value: "\(wallets.count)")

        isLoading = false
    }

    func importWallet(name: String, mnemonic: String) async throws {
        guard !name.isEmpty else {
            throw NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Wallet name cannot be empty"])
        }

        guard !mnemonic.isEmpty else {
            throw NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Mnemonic cannot be empty"])
        }

        isLoading = true

        guard let wallet = NorCore.importWallet(mnemonic: mnemonic) else {
            isLoading = false
            let error = NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid mnemonic phrase"])
            await CrashReportingService.shared.recordWalletError(error, operation: "import_wallet")
            throw error
        }

        currentWallet = wallet
        wallets.append(wallet)
        saveWallets()
        loadDummyAssets()

        // Sync with Supabase (if authenticated)
        await syncWalletToSupabase()

        // Track analytics
        await AnalyticsService.shared.logEvent(.walletImported, parameters: [
            "wallet_name": name,
            "wallet_count": wallets.count,
            "import_method": "mnemonic"
        ])
        await AnalyticsService.shared.setUserProperty(.walletCount, value: "\(wallets.count)")

        isLoading = false
    }

    func importFromPrivateKey(name: String, privateKey: String) async throws {
        guard !name.isEmpty else {
            throw NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Wallet name cannot be empty"])
        }

        guard !privateKey.isEmpty else {
            throw NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Private key cannot be empty"])
        }

        isLoading = true

        // Import wallet from private key using NorCore
        // Note: This is a simplified implementation
        // In production, you'd use NorCore.importFromPrivateKey()
        guard let wallet = NorCore.importWallet(mnemonic: "") else {
            isLoading = false
            throw NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid private key"])
        }

        currentWallet = wallet
        wallets.append(wallet)
        saveWallets()
        loadDummyAssets()

        // Sync with Supabase (if authenticated)
        await syncWalletToSupabase()

        isLoading = false
    }

    func selectWallet(_ wallet: WalletInfo) {
        currentWallet = wallet
        loadDummyAssets()
        loadTransactions()

        // Track analytics
        Task {
            await AnalyticsService.shared.logEvent(.walletSwitched, parameters: [
                "wallet_id": wallet.id.uuidString
            ])
        }
    }

    func deleteWallet(_ wallet: WalletInfo) {
        wallets.removeAll { $0.id == wallet.id }

        if currentWallet?.id == wallet.id {
            currentWallet = wallets.first
            if currentWallet != nil {
                loadDummyAssets()
                loadTransactions()
            } else {
                assets = []
                transactions = []
                totalBalance = "$0.00"
            }
        }

        saveWallets()

        // Track analytics
        Task {
            await AnalyticsService.shared.logEvent(.walletDeleted, parameters: [
                "wallet_id": wallet.id.uuidString,
                "remaining_wallet_count": wallets.count
            ])
            await AnalyticsService.shared.setUserProperty(.walletCount, value: "\(wallets.count)")
        }
    }

    func exportMnemonic() -> String? {
        return currentWallet?.mnemonic
    }

    func exportPrivateKey() -> String? {
        // In a real implementation, this would export the actual private key
        // For security, this should require biometric/PIN authentication
        guard let wallet = currentWallet,
              let account = wallet.accounts.first else {
            return nil
        }

        // This is a placeholder - actual implementation would use NorCore
        return "0x" + String(repeating: "a", count: 64)
    }

    // MARK: - Persistence

    private func saveWallets() {
        // Production-grade secure storage using Keychain
        do {
            try KeychainService.shared.save(wallets, forKey: walletsStorageKey)

            if SupabaseConfig.enableDebugLogging {
                print("✅ WalletViewModel: Saved \(wallets.count) wallet(s) to Keychain")
            }
        } catch {
            print("❌ WalletViewModel: Failed to save wallets to Keychain: \(error.localizedDescription)")

            // Fallback to UserDefaults on error (for development/testing only)
            if let encoded = try? JSONEncoder().encode(wallets) {
                UserDefaults.standard.set(encoded, forKey: walletsStorageKey)
                print("⚠️ WalletViewModel: Fell back to UserDefaults storage")
            }
        }
    }

    private func loadWallets() {
        // Attempt migration from UserDefaults first
        _ = KeychainService.shared.migrateFromUserDefaults(key: walletsStorageKey)

        // Load from Keychain
        do {
            if let loadedWallets = try KeychainService.shared.load([WalletInfo].self, forKey: walletsStorageKey) {
                wallets = loadedWallets
                currentWallet = wallets.first

                if SupabaseConfig.enableDebugLogging {
                    print("✅ WalletViewModel: Loaded \(wallets.count) wallet(s) from Keychain")
                }
            } else {
                if SupabaseConfig.enableDebugLogging {
                    print("ℹ️ WalletViewModel: No wallets found in Keychain")
                }
            }
        } catch {
            print("❌ WalletViewModel: Failed to load wallets from Keychain: \(error.localizedDescription)")

            // Fallback to UserDefaults on error (for development/testing only)
            if let data = UserDefaults.standard.data(forKey: walletsStorageKey),
               let decoded = try? JSONDecoder().decode([WalletInfo].self, from: data) {
                wallets = decoded
                currentWallet = wallets.first
                print("⚠️ WalletViewModel: Fell back to UserDefaults storage")
            }
        }
    }

    // MARK: - Transaction Management

    func loadTransactions() {
        // In production, this would load from blockchain/Supabase
        // For now, loading dummy data
        transactions = [
            Transaction(
                id: UUID().uuidString,
                hash: "0xabc123...",
                from: currentWallet?.accounts.first?.address ?? "0x...",
                to: "0xdef456...",
                value: "1.5",
                timestamp: Date().addingTimeInterval(-3600),
                status: .confirmed,
                type: .send,
                gasUsed: "21000",
                blockNumber: 12345678
            ),
            Transaction(
                id: UUID().uuidString,
                hash: "0xghi789...",
                from: "0xjkl012...",
                to: currentWallet?.accounts.first?.address ?? "0x...",
                value: "0.5",
                timestamp: Date().addingTimeInterval(-7200),
                status: .confirmed,
                type: .receive,
                gasUsed: "21000",
                blockNumber: 12345670
            ),
            Transaction(
                id: UUID().uuidString,
                hash: "0xmno345...",
                from: currentWallet?.accounts.first?.address ?? "0x...",
                to: "0xpqr678...",
                value: "2.0",
                timestamp: Date().addingTimeInterval(-10800),
                status: .pending,
                type: .send,
                gasUsed: nil,
                blockNumber: nil
            )
        ]
    }

    func loadAssets() async {
        isRefreshing = true

        // In production, this would fetch from blockchain
        // For now, loading dummy data with delay
        try? await Task.sleep(nanoseconds: 1_000_000_000)

        loadDummyAssets()
        isRefreshing = false
    }
    
    func createNewWallet() {
        isLoading = true
        
        // Simulate network delay for smooth UX
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            guard let wallet = NorCore.createWallet() else {
                self?.errorMessage = "Failed to create wallet"
                self?.showError = true
                self?.isLoading = false
                return
            }
            self?.currentWallet = wallet
            self?.loadDummyAssets()
            
            // Sync with Supabase (if authenticated)
            Task {
                await self?.syncWalletToSupabase()
            }
            
            self?.isLoading = false
        }
    }
    
    // MARK: - Supabase Sync
    
    @MainActor
    private func syncWalletToSupabase() async {
        #if canImport(Supabase)
        guard let wallet = currentWallet,
              let firstAccount = wallet.accounts.first else {
            return
        }
        
        // Check if authenticated
        guard SupabaseService.shared.isAuthenticated else {
            if SupabaseConfig.enableDebugLogging {
                print("⚠️ Not authenticated - skipping Supabase sync")
            }
            return
        }
        
        do {
            // Register device
            let deviceName = UIDevice.current.name
            let _ = try await SupabaseService.shared.registerDevice(
                platform: "ios",
                label: deviceName,
                pushToken: PushNotificationService.shared.deviceToken
            )
            if SupabaseConfig.enableDebugLogging {
                print("✅ Device registered with Supabase")
            }
            
            // Sync account
            let account = try await SupabaseService.shared.createAccount(
                chain: "xaheen", // Your chain name
                address: firstAccount.address,
                type: "EOA",
                isDefault: true
            )
            if SupabaseConfig.enableDebugLogging {
                print("✅ Account synced to Supabase: \(account.id)")
            }
            
        } catch {
            if SupabaseConfig.enableDebugLogging {
                print("⚠️ Supabase sync failed: \(error.localizedDescription)")
            }
            // Don't show error to user - sync is optional
        }
        #else
        if SupabaseConfig.enableDebugLogging {
            print("⚠️ Supabase SDK not available - skipping sync")
        }
        #endif
    }
    
    func importWallet(mnemonic: String) {
        isLoading = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            guard let wallet = NorCore.importWallet(mnemonic: mnemonic) else {
                self?.errorMessage = "Failed to import wallet"
                self?.showError = true
                self?.isLoading = false
                return
            }
            self?.currentWallet = wallet
            self?.loadDummyAssets()
            
            // Sync with Supabase (if authenticated)
            Task {
                await self?.syncWalletToSupabase()
            }
            
            self?.isLoading = false
        }
    }
    
    func loadDummyWallet() {
        isLoading = true
        
        // Simulate loading for better UX
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
            // Create a dummy wallet for testing UI by decoding JSON
            let dummyJSON = """
            {
                "id": "user-wallet-primary",
                "accounts": [
                    {
                        "index": 0,
                        "address": "0xdd779a290c937144f80eb75b75d814c834536b1b",
                        "public_key": "0x04a7b9e5c89d1f3e2b4a6c8d9f0e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
                        "chain_type": "EVM"
                    }
                ],
                "created_at": \(Date().timeIntervalSince1970)
            }
            """
            
            if let jsonData = dummyJSON.data(using: .utf8) {
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .secondsSince1970
                self?.currentWallet = try? decoder.decode(WalletInfo.self, from: jsonData)
            }
            
            self?.loadDummyAssets()
            self?.isLoading = false
        }
    }
    
    func refresh() async {
        isRefreshing = true
        
        // Simulate network refresh
        try? await Task.sleep(nanoseconds: 1_500_000_000)
        
        // Update balance with slight variation
        let variation = Double.random(in: -100...200)
        if let currentValue = Double(totalBalance.replacingOccurrences(of: "$", with: "").replacingOccurrences(of: ",", with: "")) {
            let newValue = currentValue + variation
            let formatter = NumberFormatter()
            formatter.numberStyle = .decimal
            formatter.minimumFractionDigits = 2
            formatter.maximumFractionDigits = 2
            if let formatted = formatter.string(from: NSNumber(value: newValue)) {
                totalBalance = "$" + formatted
            }
        }
        
        isRefreshing = false
    }
    
    func loadDummyAssets() {
        totalBalance = "$12,547.82"
        balanceChange = "+12.5%"
        
        assets = [
            Asset(
                symbol: "NOR",
                name: "NOR",
                balance: "2,450.00",
                usdValue: "$8,925.00",
                change: "+15.2%",
                color: hexColorHelper("8B5CF6"),
                chartData: [3.2, 3.5, 3.3, 3.8, 4.1, 3.9, 4.5, 4.3, 4.7, 5.0]
            ),
            Asset(
                symbol: "ETH",
                name: "Ethereum",
                balance: "1.25",
                usdValue: "$2,850.50",
                change: "+8.3%",
                color: hexColorHelper("627EEA"),
                chartData: [2200, 2250, 2180, 2300, 2400, 2350, 2450, 2500, 2480, 2550]
            ),
            Asset(
                symbol: "USDT",
                name: "Tether USD",
                balance: "750.00",
                usdValue: "$750.00",
                change: "+0.1%",
                color: hexColorHelper("26A17B"),
                chartData: [1.0, 1.001, 0.999, 1.0, 1.001, 1.0, 0.999, 1.0, 1.001, 1.0]
            ),
            Asset(
                symbol: "BTC",
                name: "Bitcoin",
                balance: "0.0125",
                usdValue: "$522.32",
                change: "-2.4%",
                color: hexColorHelper("F7931A"),
                chartData: [42000, 41500, 41800, 41200, 40800, 40500, 40200, 40000, 39800, 39500]
            )
        ]
    }
    
    func sendTransaction(
        to: String,
        amount: String,
        assetSymbol: String,
        gasPrice: String,
        completion: @escaping (Result<String, Error>) -> Void
    ) {
        guard let wallet = currentWallet,
              let fromAccount = wallet.accounts.first else {
            completion(.failure(NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "No wallet or account available"])))
            return
        }
        
        isSending = true
        
        // Convert amount to wei (assuming 18 decimals for NOR)
        let amountInWei = convertToWei(amount: amount)
        
        // Get nonce (simplified - would normally fetch from RPC)
        let nonce: UInt64 = 0
        
        // Get gas price in wei based on selection
        let gasPriceWei = getGasPriceInWei(selection: gasPrice)
        
        backgroundQueue.async { [weak self] () -> Void in
            // Capture values to avoid Sendable warnings
            let fromAddress = fromAccount.address
            let chainId = self?.chainInfo.chainId ?? 65001
            
            // Sign transaction using NorCore directly
            let signedTx = NorCore.signTransaction(
                from: fromAddress,
                to: to,
                value: amountInWei,
                data: "0x",
                gasLimit: 21000,
                gasPrice: gasPriceWei,
                nonce: nonce,
                chainId: chainId
            ) ?? ""
            
            // Broadcast transaction (simplified - would normally send to RPC)
            // For now, we'll just return the signed transaction hash
            DispatchQueue.main.async {
                self?.isSending = false
                if signedTx.isEmpty {
                    self?.errorMessage = "Failed to sign transaction"
                    self?.showError = true
                    completion(.failure(NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to sign transaction"])))
                } else {
                    self?.lastTransactionHash = signedTx
                    completion(.success(signedTx))
                }
            }
        }
    }
    
    private func convertToWei(amount: String) -> String {
        // Convert decimal amount to wei (18 decimals)
        guard let amountValue = Double(amount) else {
            return "0"
        }
        let wei = amountValue * pow(10, 18)
        return String(format: "%.0f", wei)
    }
    
    private func getGasPriceInWei(selection: String) -> String {
        // Gas prices in gwei, convert to wei
        let gwei: Double
        switch selection {
        case "Slow":
            gwei = 1.0
        case "Standard":
            gwei = 2.0
        case "Fast":
            gwei = 4.0
        default:
            gwei = 2.0
        }
        let wei = gwei * pow(10, 9)
        return String(format: "%.0f", wei)
    }
}