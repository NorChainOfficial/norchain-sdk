//
//  AnalyticsService.swift
//  NorWallet
//
//  Created on November 5, 2025.
//  Analytics and user behavior tracking service
//

import Foundation

/// Analytics event categories
enum AnalyticsEvent: String {
    // Wallet Events
    case walletCreated = "wallet_created"
    case walletImported = "wallet_imported"
    case walletDeleted = "wallet_deleted"
    case walletSwitched = "wallet_switched"
    case walletBackedUp = "wallet_backed_up"

    // Transaction Events
    case transactionInitiated = "transaction_initiated"
    case transactionSigned = "transaction_signed"
    case transactionSent = "transaction_sent"
    case transactionConfirmed = "transaction_confirmed"
    case transactionFailed = "transaction_failed"

    // Network Events
    case networkSwitched = "network_switched"
    case rpcEndpointChanged = "rpc_endpoint_changed"

    // Security Events
    case biometricEnabled = "biometric_enabled"
    case biometricDisabled = "biometric_disabled"
    case autoLockEnabled = "auto_lock_enabled"
    case autoLockDisabled = "auto_lock_disabled"
    case appLocked = "app_locked"
    case appUnlocked = "app_unlocked"

    // Feature Usage
    case dappBrowserOpened = "dapp_browser_opened"
    case dappConnected = "dapp_connected"
    case dappDisconnected = "dapp_disconnected"
    case qrCodeScanned = "qr_code_scanned"
    case addressCopied = "address_copied"

    // Account Abstraction
    case gaslessTxInitiated = "gasless_tx_initiated"
    case paymasterSponsored = "paymaster_sponsored"
    case batchTxCreated = "batch_tx_created"

    // Bridge/Swap
    case bridgeInitiated = "bridge_initiated"
    case bridgeCompleted = "bridge_completed"
    case swapInitiated = "swap_initiated"
    case swapCompleted = "swap_completed"

    // Errors
    case errorOccurred = "error_occurred"
    case apiError = "api_error"
    case networkError = "network_error"

    // App Lifecycle
    case appOpened = "app_opened"
    case appBackgrounded = "app_backgrounded"
    case appUpdated = "app_updated"
    case onboardingCompleted = "onboarding_completed"
}

/// User properties for analytics
enum UserProperty: String {
    case userId = "user_id"
    case walletCount = "wallet_count"
    case preferredNetwork = "preferred_network"
    case biometricEnabled = "biometric_enabled"
    case appVersion = "app_version"
    case deviceModel = "device_model"
    case osVersion = "os_version"
}

/// Analytics service protocol for dependency injection
protocol AnalyticsServiceProtocol: Actor {
    func logEvent(_ event: AnalyticsEvent, parameters: [String: Any]?) async
    func setUserProperty(_ property: UserProperty, value: String?) async
    func setUserId(_ userId: String?) async
    func resetAnalytics() async
}

/// Production analytics service with Firebase support
@MainActor
class AnalyticsService: ObservableObject, AnalyticsServiceProtocol {
    static let shared = AnalyticsService()

    @Published private(set) var isEnabled: Bool = true
    private var eventQueue: [(event: AnalyticsEvent, parameters: [String: Any]?, timestamp: Date)] = []
    private let maxQueueSize = 100

    // Firebase Analytics will be initialized here when added
    // import FirebaseAnalytics
    // private var analytics: Analytics?

    private init() {
        configure()
    }

    // MARK: - Configuration

    private func configure() {
        // Using Supabase for analytics (already configured in SupabaseService)

        if SupabaseConfig.enableDebugLogging {
            print("📊 AnalyticsService: Initialized with Supabase backend")
        }

        // Set default user properties
        Task {
            await setDefaultUserProperties()
        }
    }

    private func setDefaultUserProperties() async {
        await setUserProperty(.appVersion, value: getAppVersion())
        await setUserProperty(.deviceModel, value: getDeviceModel())
        await setUserProperty(.osVersion, value: getOSVersion())
    }

    // MARK: - Public API

    /// Log an analytics event
    /// - Parameters:
    ///   - event: The event to log
    ///   - parameters: Optional event parameters
    func logEvent(_ event: AnalyticsEvent, parameters: [String: Any]? = nil) async {
        guard isEnabled else { return }

        // Add timestamp
        let timestamp = Date()

        // Queue event locally
        queueEvent(event: event, parameters: parameters, timestamp: timestamp)

        // Send to Supabase
        await sendEventToSupabase(event: event, parameters: parameters)

        if SupabaseConfig.enableDebugLogging {
            var logMessage = "📊 Analytics: \(event.rawValue)"
            if let params = parameters {
                logMessage += " | Parameters: \(params)"
            }
            print(logMessage)
        }
    }

    /// Send event to Supabase
    private func sendEventToSupabase(event: AnalyticsEvent, parameters: [String: Any]?) async {
        #if canImport(Supabase)
        do {
            let deviceId = getDeviceId()
            let eventData: [String: Any] = [
                "device_id": deviceId,
                "event_name": event.rawValue,
                "event_parameters": parameters ?? [:],
                "app_version": getAppVersion(),
                "device_model": getDeviceModel(),
                "os_version": getOSVersion()
            ]

            // Insert into Supabase
            let encoder = JSONEncoder()
            encoder.keyEncodingStrategy = .convertToSnakeCase
            let jsonData = try encoder.encode(AnyCodableDict(eventData))

            _ = try await SupabaseService.shared.supabase
                .from("analytics_events")
                .insert(jsonData)
                .execute()

            if SupabaseConfig.enableDebugLogging {
                print("📊 Analytics: Event sent to Supabase - \(event.rawValue)")
            }
        } catch {
            if SupabaseConfig.enableDebugLogging {
                print("📊 Analytics: Failed to send event to Supabase - \(error.localizedDescription)")
            }
        }
        #endif
    }

    /// Set a user property
    /// - Parameters:
    ///   - property: The property to set
    ///   - value: The property value (nil to remove)
    func setUserProperty(_ property: UserProperty, value: String?) async {
        guard isEnabled else { return }

        // Firebase implementation:
        // Analytics.setUserProperty(value, forName: property.rawValue)

        if SupabaseConfig.enableDebugLogging {
            print("📊 Analytics: Set user property \(property.rawValue) = \(value ?? "nil")")
        }
    }

    /// Set the user ID for analytics
    /// - Parameter userId: The user ID (nil to clear)
    func setUserId(_ userId: String?) async {
        guard isEnabled else { return }

        // Firebase implementation:
        // Analytics.setUserID(userId)

        if SupabaseConfig.enableDebugLogging {
            print("📊 Analytics: Set user ID = \(userId ?? "nil")")
        }
    }

    /// Reset all analytics data (e.g., on logout)
    func resetAnalytics() async {
        // Firebase implementation:
        // Analytics.resetAnalyticsData()

        eventQueue.removeAll()

        if SupabaseConfig.enableDebugLogging {
            print("📊 Analytics: Reset analytics data")
        }
    }

    // MARK: - Event Queue Management

    private func queueEvent(event: AnalyticsEvent, parameters: [String: Any]?, timestamp: Date) {
        eventQueue.append((event: event, parameters: parameters, timestamp: timestamp))

        // Maintain queue size
        if eventQueue.count > maxQueueSize {
            eventQueue.removeFirst()
        }
    }

    /// Get recent events (useful for debugging)
    func getRecentEvents(limit: Int = 10) -> [(event: AnalyticsEvent, parameters: [String: Any]?, timestamp: Date)] {
        return Array(eventQueue.suffix(limit))
    }

    // MARK: - Convenience Methods

    /// Log a screen view event
    func logScreenView(_ screenName: String, screenClass: String? = nil) async {
        var parameters: [String: Any] = ["screen_name": screenName]
        if let screenClass = screenClass {
            parameters["screen_class"] = screenClass
        }

        // Firebase has a dedicated method:
        // Analytics.logEvent(AnalyticsEventScreenView, parameters: parameters)

        if SupabaseConfig.enableDebugLogging {
            print("📊 Analytics: Screen view - \(screenName)")
        }
    }

    /// Log a purchase/transaction event
    func logTransaction(
        transactionId: String,
        value: Double,
        currency: String,
        items: [[String: Any]]? = nil
    ) async {
        var parameters: [String: Any] = [
            "transaction_id": transactionId,
            "value": value,
            "currency": currency
        ]

        if let items = items {
            parameters["items"] = items
        }

        await logEvent(.transactionSent, parameters: parameters)
    }

    /// Log an error event
    func logError(
        error: Error,
        context: String,
        isFatal: Bool = false
    ) async {
        let parameters: [String: Any] = [
            "error_message": error.localizedDescription,
            "context": context,
            "is_fatal": isFatal,
            "error_domain": (error as NSError).domain,
            "error_code": (error as NSError).code
        ]

        await logEvent(.errorOccurred, parameters: parameters)
    }

    // MARK: - Enable/Disable

    /// Enable or disable analytics collection
    func setAnalyticsEnabled(_ enabled: Bool) {
        isEnabled = enabled

        // Firebase implementation:
        // Analytics.setAnalyticsCollectionEnabled(enabled)

        if SupabaseConfig.enableDebugLogging {
            print("📊 Analytics: Collection \(enabled ? "enabled" : "disabled")")
        }
    }

    // MARK: - Helper Methods

    private func getAppVersion() -> String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "unknown"
        return "\(version)(\(build))"
    }

    private func getDeviceModel() -> String {
        var systemInfo = utsname()
        uname(&systemInfo)
        let modelCode = withUnsafePointer(to: &systemInfo.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: 1) {
                String(validatingUTF8: $0)
            }
        }
        return modelCode ?? "unknown"
    }

    private func getOSVersion() -> String {
        let osVersion = ProcessInfo.processInfo.operatingSystemVersion
        return "\(osVersion.majorVersion).\(osVersion.minorVersion).\(osVersion.patchVersion)"
    }
}

    // MARK: - Device ID Management

    private func getDeviceId() -> String {
        // Get or generate a persistent device ID
        let key = "analytics_device_id"

        if let existingId = UserDefaults.standard.string(forKey: key) {
            return existingId
        }

        let newId = UUID().uuidString
        UserDefaults.standard.set(newId, forKey: key)
        return newId
    }
}

// MARK: - Helper Types

/// Helper to encode [String: Any] dictionaries
struct AnyCodableDict: Codable {
    let value: [String: AnyCodable]

    init(_ dictionary: [String: Any]) {
        self.value = dictionary.mapValues { AnyCodable($0) }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(value)
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        value = try container.decode([String: AnyCodable].self)
    }
}

/// Type-erased Codable wrapper
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case let string as String:
            try container.encode(string)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let bool as Bool:
            try container.encode(bool)
        case let dict as [String: Any]:
            try container.encode(AnyCodableDict(dict))
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        default:
            try container.encodeNil()
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues { $0.value }
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else {
            value = NSNull()
        }
    }
}

// MARK: - Mock Analytics Service for Testing

/// Mock analytics service that doesn't send data
actor MockAnalyticsService: AnalyticsServiceProtocol {
    private(set) var loggedEvents: [(event: AnalyticsEvent, parameters: [String: Any]?)] = []
    private(set) var userProperties: [UserProperty: String] = [:]
    private(set) var userId: String?

    func logEvent(_ event: AnalyticsEvent, parameters: [String: Any]?) async {
        loggedEvents.append((event: event, parameters: parameters))
    }

    func setUserProperty(_ property: UserProperty, value: String?) async {
        userProperties[property] = value
    }

    func setUserId(_ userId: String?) async {
        self.userId = userId
    }

    func resetAnalytics() async {
        loggedEvents.removeAll()
        userProperties.removeAll()
        userId = nil
    }

    /// Get count of logged events
    func getEventCount(for event: AnalyticsEvent) -> Int {
        return loggedEvents.filter { $0.event == event }.count
    }
}
