import Foundation
import SwiftUI
import LocalAuthentication

enum BiometricType {
    case faceID
    case touchID
    case none
}

/// Settings Manager - Persists all wallet settings
/// Uses UserDefaults for persistence and provides reactive updates
class SettingsManager: ObservableObject {
    static let shared = SettingsManager()
    
    // MARK: - Security Settings
    @AppStorage("biometric_enabled") var biometricEnabled: Bool = false
    @AppStorage("pin_enabled") var pinEnabled: Bool = false
    @AppStorage("pin_code") private var pinCode: String = ""
    @AppStorage("auto_lock_enabled") var autoLockEnabled: Bool = true
    @AppStorage("auto_lock_minutes") var autoLockMinutes: Int = 5
    @AppStorage("require_auth_for_transactions") var requireAuthForTransactions: Bool = true
    
    // MARK: - Network Settings
    @AppStorage("selected_chain_id") var selectedChainId: Int = 65001
    @AppStorage("selected_chain_name") var selectedChainName: String = "Nor Chain"
    @AppStorage("selected_rpc_url") var selectedRpcUrl: String = "https://rpc.norchain.org"
    
    // MARK: - Notification Settings
    @AppStorage("notifications_transactions") var transactionsEnabled: Bool = true
    @AppStorage("notifications_security") var securityEnabled: Bool = true
    @AppStorage("notifications_price") var priceAlertsEnabled: Bool = true
    @AppStorage("notifications_dapps") var dappsEnabled: Bool = true
    @AppStorage("notification_sound") var notificationSound: String = "default"
    @AppStorage("do_not_disturb_enabled") var doNotDisturbEnabled: Bool = false
    @AppStorage("do_not_disturb_start") var doNotDisturbStart: String = "22:00"
    @AppStorage("do_not_disturb_end") var doNotDisturbEnd: String = "08:00"
    
    // MARK: - Account Settings
    @AppStorage("account_names") private var accountNamesJSON: String = "{}"
    @AppStorage("wallet_backed_up") var walletBackedUp: Bool = false
    @AppStorage("last_backup_date_timestamp") private var lastBackupDateTimestamp: Double = 0
    
    var lastBackupDate: Date? {
        get {
            return lastBackupDateTimestamp > 0 ? Date(timeIntervalSince1970: lastBackupDateTimestamp) : nil
        }
        set {
            lastBackupDateTimestamp = newValue?.timeIntervalSince1970 ?? 0
        }
    }
    
    // MARK: - App Settings
    @AppStorage("currency") var currency: String = "USD"
    @AppStorage("language") var language: String = "en"
    @AppStorage("theme") var theme: String = "dark"
    @AppStorage("hide_balance") var hideBalance: Bool = false
    
    private init() {
        loadSettings()
    }
    
    // MARK: - Biometric Authentication
    func checkBiometricAvailability() -> (available: Bool, type: BiometricType) {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            let type = context.biometryType == .faceID ? BiometricType.faceID : BiometricType.touchID
            return (true, type)
        }
        return (false, .none)
    }
    
    // MARK: - PIN Management
    func setPIN(_ pin: String) {
        pinCode = pin
        pinEnabled = true
    }
    
    func verifyPIN(_ pin: String) -> Bool {
        return pinCode == pin
    }
    
    func removePIN() {
        pinCode = ""
        pinEnabled = false
    }
    
    // MARK: - Account Names
    func getAccountName(for address: String) -> String? {
        guard let data = accountNamesJSON.data(using: .utf8),
              let names = try? JSONDecoder().decode([String: String].self, from: data) else {
            return nil
        }
        return names[address]
    }
    
    func setAccountName(_ name: String, for address: String) {
        var names: [String: String] = [:]
        if let data = accountNamesJSON.data(using: .utf8),
           let existing = try? JSONDecoder().decode([String: String].self, from: data) {
            names = existing
        }
        names[address] = name
        if let jsonData = try? JSONEncoder().encode(names),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            accountNamesJSON = jsonString
        }
    }
    
    // MARK: - Network Management
    func updateNetwork(chainId: UInt64, name: String, rpcUrl: String) {
        selectedChainId = Int(chainId)
        selectedChainName = name
        selectedRpcUrl = rpcUrl
    }
    
    // MARK: - Persistence
    private func loadSettings() {
        // Settings are automatically loaded via @AppStorage
    }
    
    func resetAllSettings() {
        // Reset to defaults (keep wallet data)
        biometricEnabled = false
        pinEnabled = false
        pinCode = ""
        autoLockEnabled = true
        autoLockMinutes = 5
        requireAuthForTransactions = true
        selectedChainId = 65001
        selectedChainName = "Nor Chain"
        selectedRpcUrl = "https://rpc.norchain.org"
        transactionsEnabled = true
        securityEnabled = true
        priceAlertsEnabled = true
        dappsEnabled = true
        accountNamesJSON = "{}"
        walletBackedUp = false
        lastBackupDate = nil
    }
}

