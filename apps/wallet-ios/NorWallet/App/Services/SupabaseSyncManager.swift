import Foundation
import Supabase

/// Manages automatic synchronization between local wallet and Supabase
@MainActor
class SupabaseSyncManager: ObservableObject {
    static let shared = SupabaseSyncManager()
    
    @Published var isSyncing = false
    @Published var lastSyncTime: Date?
    @Published var syncError: String?
    
    private let supabaseService = SupabaseService.shared
    private var syncTask: Task<Void, Never>?
    
    private init() {
        // Check for existing session on init
        Task {
            await checkAuthentication()
        }
    }
    
    // MARK: - Authentication Check
    
    func checkAuthentication() async {
        await supabaseService.checkSession()
    }
    
    // MARK: - Sync Operations
    
    /// Sync wallet to Supabase (called automatically on wallet creation/import)
    func syncWallet(wallet: WalletInfo) async {
        guard supabaseService.isAuthenticated else {
            if SupabaseConfig.enableDebugLogging {
                print("⚠️ SupabaseSyncManager: Not authenticated - skipping sync")
            }
            return
        }
        
        guard let firstAccount = wallet.accounts.first else {
            if SupabaseConfig.enableDebugLogging {
                print("⚠️ SupabaseSyncManager: No accounts in wallet")
            }
            return
        }
        
        isSyncing = true
        syncError = nil
        
        do {
            // Register device
            let deviceName = UIDevice.current.name
            let device = try await supabaseService.registerDevice(
                platform: "ios",
                label: deviceName,
                pushToken: PushNotificationService.shared.deviceToken
            )
            if SupabaseConfig.enableDebugLogging {
                print("✅ SupabaseSyncManager: Device registered - \(device.id)")
            }
            
            // Sync account
            let account = try await supabaseService.createAccount(
                chain: "xaheen",
                address: firstAccount.address,
                type: "EOA",
                isDefault: true
            )
            if SupabaseConfig.enableDebugLogging {
                print("✅ SupabaseSyncManager: Account synced - \(account.id)")
            }
            
            lastSyncTime = Date()
            isSyncing = false
            
        } catch {
            syncError = error.localizedDescription
            if SupabaseConfig.enableDebugLogging {
                print("❌ SupabaseSyncManager: Sync failed - \(error.localizedDescription)")
            }
            isSyncing = false
        }
    }
    
    /// Sync all accounts from wallet
    func syncAllAccounts(wallet: WalletInfo) async {
        guard supabaseService.isAuthenticated else {
            return
        }
        
        isSyncing = true
        
        for account in wallet.accounts {
            do {
                let _ = try await supabaseService.createAccount(
                    chain: "xaheen",
                    address: account.address,
                    type: "EOA",
                    isDefault: account.index == 0
                )
                if SupabaseConfig.enableDebugLogging {
                    print("✅ Synced account: \(account.address)")
                }
            } catch {
                if SupabaseConfig.enableDebugLogging {
                    print("⚠️ Failed to sync account \(account.address): \(error.localizedDescription)")
                }
            }
        }
        
        isSyncing = false
        lastSyncTime = Date()
    }
    
    /// Sync transaction to Supabase
    func syncTransaction(
        chain: String,
        accountAddress: String,
        txHash: String,
        status: String,
        direction: String,
        asset: String,
        value: String?
    ) async {
        guard supabaseService.isAuthenticated else {
            return
        }
        
        // Note: Transaction sync would need to be added to SupabaseService
        // For now, this is a placeholder
        if SupabaseConfig.enableDebugLogging {
            print("📝 Transaction sync: \(txHash)")
        }
    }
    
    // MARK: - Background Sync
    
    /// Start background sync task
    func startBackgroundSync(wallet: WalletInfo) {
        syncTask?.cancel()
        
        syncTask = Task {
            // Sync every 5 minutes
            while !Task.isCancelled {
                await syncWallet(wallet: wallet)
                try? await Task.sleep(nanoseconds: 5 * 60 * 1_000_000_000)
            }
        }
    }
    
    /// Stop background sync
    func stopBackgroundSync() {
        syncTask?.cancel()
        syncTask = nil
    }
}

