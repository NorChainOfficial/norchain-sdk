//
//  CrashReportingService.swift
//  NorWallet
//
//  Created on November 5, 2025.
//  Crash reporting and error tracking service
//

import Foundation

/// Crash severity levels
enum CrashSeverity: String {
    case fatal = "fatal"
    case error = "error"
    case warning = "warning"
    case info = "info"
    case debug = "debug"
}

/// Crash reporting service protocol
protocol CrashReportingServiceProtocol: Actor {
    func recordError(_ error: Error, context: [String: Any]?) async
    func recordNonFatalError(_ error: Error, context: [String: Any]?) async
    func log(_ message: String, severity: CrashSeverity) async
    func setCustomKey(_ key: String, value: Any) async
    func setUserId(_ userId: String?) async
}

/// Production crash reporting service with Firebase Crashlytics support
@MainActor
class CrashReportingService: ObservableObject, CrashReportingServiceProtocol {
    static let shared = CrashReportingService()

    @Published private(set) var isEnabled: Bool = true
    @Published private(set) var errorCount: Int = 0

    // Firebase Crashlytics will be initialized here when added
    // import FirebaseCrashlytics
    // private var crashlytics: Crashlytics?

    private var errorLog: [(error: Error, context: [String: Any]?, timestamp: Date)] = []
    private let maxLogSize = 50

    private init() {
        configure()
    }

    // MARK: - Configuration

    private func configure() {
        // Using Supabase for crash reporting (already configured in SupabaseService)

        if SupabaseConfig.enableDebugLogging {
            print("🔥 CrashReportingService: Initialized with Supabase backend")
        }

        // Set default keys
        Task {
            await setDefaultKeys()
        }
    }

    private func setDefaultKeys() async {
        await setCustomKey("app_version", value: getAppVersion())
        await setCustomKey("device_model", value: getDeviceModel())
        await setCustomKey("os_version", value: getOSVersion())
        await setCustomKey("build_configuration", value: getBuildConfiguration())
    }

    // MARK: - Public API

    /// Record a fatal error (will be reported as crash)
    /// - Parameters:
    ///   - error: The error to record
    ///   - context: Additional context information
    func recordError(_ error: Error, context: [String: Any]? = nil) async {
        guard isEnabled else { return }

        errorCount += 1
        logError(error: error, context: context)

        // Send to Supabase
        await sendCrashToSupabase(error: error, context: context, isFatal: true)

        if SupabaseConfig.enableDebugLogging {
            var logMessage = "🔥 Crash: FATAL - \(error.localizedDescription)"
            if let context = context {
                logMessage += " | Context: \(context)"
            }
            print(logMessage)
        }
    }

    /// Record a non-fatal error
    /// - Parameters:
    ///   - error: The error to record
    ///   - context: Additional context information
    func recordNonFatalError(_ error: Error, context: [String: Any]? = nil) async {
        guard isEnabled else { return }

        errorCount += 1
        logError(error: error, context: context)

        // Send to Supabase
        await sendCrashToSupabase(error: error, context: context, isFatal: false)

        if SupabaseConfig.enableDebugLogging {
            var logMessage = "🔥 Crash: Non-fatal - \(error.localizedDescription)"
            if let context = context {
                logMessage += " | Context: \(context)"
            }
            print(logMessage)
        }
    }

    /// Send crash report to Supabase
    private func sendCrashToSupabase(error: Error, context: [String: Any]?, isFatal: Bool) async {
        #if canImport(Supabase)
        do {
            let nsError = error as NSError
            let deviceId = getDeviceId()

            let crashData: [String: Any] = [
                "device_id": deviceId,
                "error_domain": nsError.domain,
                "error_code": nsError.code,
                "error_message": error.localizedDescription,
                "error_context": context ?? [:],
                "is_fatal": isFatal,
                "app_version": getAppVersion(),
                "device_model": getDeviceModel(),
                "os_version": getOSVersion()
            ]

            // Insert into Supabase
            let encoder = JSONEncoder()
            encoder.keyEncodingStrategy = .convertToSnakeCase
            let jsonData = try encoder.encode(AnyCodableDict(crashData))

            _ = try await SupabaseService.shared.supabase
                .from("crash_reports")
                .insert(jsonData)
                .execute()

            if SupabaseConfig.enableDebugLogging {
                print("🔥 Crash: Report sent to Supabase - \(nsError.domain):\(nsError.code)")
            }
        } catch {
            if SupabaseConfig.enableDebugLogging {
                print("🔥 Crash: Failed to send report to Supabase - \(error.localizedDescription)")
            }
        }
        #endif
    }

    /// Log a custom message
    /// - Parameters:
    ///   - message: The message to log
    ///   - severity: Severity level
    func log(_ message: String, severity: CrashSeverity = .info) async {
        guard isEnabled else { return }

        // Firebase Crashlytics implementation:
        // crashlytics?.log(message)

        if SupabaseConfig.enableDebugLogging {
            let icon = severityIcon(for: severity)
            print("🔥 Crash Log [\(severity.rawValue.uppercased())]: \(icon) \(message)")
        }
    }

    /// Set a custom key-value pair for crash context
    /// - Parameters:
    ///   - key: The key name
    ///   - value: The value (supports String, Int, Bool, Double, etc.)
    func setCustomKey(_ key: String, value: Any) async {
        guard isEnabled else { return }

        // Firebase Crashlytics implementation:
        // crashlytics?.setCustomValue(value, forKey: key)

        if SupabaseConfig.enableDebugLogging {
            print("🔥 Crash: Set custom key '\(key)' = '\(value)'")
        }
    }

    /// Set user identifier for crash reports
    /// - Parameter userId: The user ID (nil to clear)
    func setUserId(_ userId: String?) async {
        guard isEnabled else { return }

        // Firebase Crashlytics implementation:
        // crashlytics?.setUserID(userId)

        if SupabaseConfig.enableDebugLogging {
            print("🔥 Crash: Set user ID = \(userId ?? "nil")")
        }
    }

    // MARK: - Error Logging

    private func logError(error: Error, context: [String: Any]?) {
        let timestamp = Date()
        errorLog.append((error: error, context: context, timestamp: timestamp))

        // Maintain log size
        if errorLog.count > maxLogSize {
            errorLog.removeFirst()
        }
    }

    /// Get recent errors (useful for debugging)
    func getRecentErrors(limit: Int = 10) -> [(error: Error, context: [String: Any]?, timestamp: Date)] {
        return Array(errorLog.suffix(limit))
    }

    // MARK: - Convenience Methods

    /// Record a network error
    func recordNetworkError(
        _ error: Error,
        endpoint: String,
        method: String,
        statusCode: Int? = nil
    ) async {
        var context: [String: Any] = [
            "endpoint": endpoint,
            "method": method,
            "error_type": "network"
        ]

        if let statusCode = statusCode {
            context["status_code"] = statusCode
        }

        await recordNonFatalError(error, context: context)
    }

    /// Record a database error
    func recordDatabaseError(
        _ error: Error,
        table: String,
        operation: String
    ) async {
        let context: [String: Any] = [
            "table": table,
            "operation": operation,
            "error_type": "database"
        ]

        await recordNonFatalError(error, context: context)
    }

    /// Record a crypto/wallet error
    func recordWalletError(
        _ error: Error,
        operation: String,
        network: String? = nil
    ) async {
        var context: [String: Any] = [
            "operation": operation,
            "error_type": "wallet"
        ]

        if let network = network {
            context["network"] = network
        }

        await recordNonFatalError(error, context: context)
    }

    /// Record a security-related error
    func recordSecurityError(
        _ error: Error,
        context: String
    ) async {
        let contextDict: [String: Any] = [
            "context": context,
            "error_type": "security",
            "severity": "high"
        ]

        await recordError(error, context: contextDict)
    }

    /// Force a test crash (use only in development!)
    func forceCrash() {
        #if DEBUG
        fatalError("Test crash triggered by CrashReportingService")
        #else
        if SupabaseConfig.enableDebugLogging {
            print("🔥 Crash: forceCrash() called in RELEASE mode - ignoring")
        }
        #endif
    }

    // MARK: - Enable/Disable

    /// Enable or disable crash reporting
    func setCrashReportingEnabled(_ enabled: Bool) {
        isEnabled = enabled

        // Firebase Crashlytics implementation:
        // Crashlytics.crashlytics().setCrashlyticsCollectionEnabled(enabled)

        if SupabaseConfig.enableDebugLogging {
            print("🔥 Crash: Reporting \(enabled ? "enabled" : "disabled")")
        }
    }

    /// Check if crash reporting is available
    func isCrashlyticsAvailable() -> Bool {
        // Firebase Crashlytics implementation:
        // return Crashlytics.crashlytics() != nil
        return true // Always true for now
    }

    // MARK: - Crash Analytics

    /// Get error statistics
    func getErrorStats() -> (total: Int, recent: Int, avgPerDay: Double) {
        let total = errorCount
        let recent = errorLog.count

        // Calculate average per day (based on recent logs)
        guard !errorLog.isEmpty else {
            return (total: total, recent: recent, avgPerDay: 0.0)
        }

        let oldestError = errorLog.first!.timestamp
        let daysSinceOldest = Date().timeIntervalSince(oldestError) / (24 * 3600)
        let avgPerDay = daysSinceOldest > 0 ? Double(recent) / daysSinceOldest : 0.0

        return (total: total, recent: recent, avgPerDay: avgPerDay)
    }

    // MARK: - Helper Methods

    private func severityIcon(for severity: CrashSeverity) -> String {
        switch severity {
        case .fatal: return "💀"
        case .error: return "❌"
        case .warning: return "⚠️"
        case .info: return "ℹ️"
        case .debug: return "🐛"
        }
    }

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

    private func getBuildConfiguration() -> String {
        #if DEBUG
        return "debug"
        #else
        return "release"
        #endif
    }
}

    // MARK: - Device ID Management

    private func getDeviceId() -> String {
        // Get or generate a persistent device ID
        let key = "crashreporting_device_id"

        if let existingId = UserDefaults.standard.string(forKey: key) {
            return existingId
        }

        let newId = UUID().uuidString
        UserDefaults.standard.set(newId, forKey: key)
        return newId
    }
}

// MARK: - Mock Crash Reporting Service for Testing

/// Mock crash reporting service that doesn't send data
actor MockCrashReportingService: CrashReportingServiceProtocol {
    private(set) var recordedErrors: [(error: Error, context: [String: Any]?)] = []
    private(set) var loggedMessages: [(message: String, severity: CrashSeverity)] = []
    private(set) var customKeys: [String: Any] = [:]
    private(set) var userId: String?

    func recordError(_ error: Error, context: [String: Any]?) async {
        recordedErrors.append((error: error, context: context))
    }

    func recordNonFatalError(_ error: Error, context: [String: Any]?) async {
        recordedErrors.append((error: error, context: context))
    }

    func log(_ message: String, severity: CrashSeverity) async {
        loggedMessages.append((message: message, severity: severity))
    }

    func setCustomKey(_ key: String, value: Any) async {
        customKeys[key] = value
    }

    func setUserId(_ userId: String?) async {
        self.userId = userId
    }

    /// Get count of recorded errors
    func getErrorCount() -> Int {
        return recordedErrors.count
    }

    /// Reset all recorded data
    func reset() {
        recordedErrors.removeAll()
        loggedMessages.removeAll()
        customKeys.removeAll()
        userId = nil
    }
}
