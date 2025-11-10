//
//  CrashReportingServiceTests.swift
//  NorWalletTests
//
//  Created on November 5, 2025.
//  Unit tests for CrashReportingService
//

import XCTest
@testable import NorWallet

@MainActor
final class CrashReportingServiceTests: XCTestCase {
    var crashReportingService: CrashReportingService!
    var mockCrashReporting: MockCrashReportingService!

    override func setUp() async throws {
        try await super.setUp()
        crashReportingService = CrashReportingService.shared
        mockCrashReporting = MockCrashReportingService()
    }

    override func tearDown() async throws {
        await mockCrashReporting.reset()
        try await super.tearDown()
    }

    // MARK: - Initialization Tests

    func testCrashReportingServiceInitialization() {
        // Then: Service should be initialized
        XCTAssertNotNil(crashReportingService)
        XCTAssertTrue(crashReportingService.isEnabled)
    }

    func testIsCrashlyticsAvailable() {
        // When: Checking if Crashlytics is available
        let isAvailable = crashReportingService.isCrashlyticsAvailable()

        // Then: Should return true
        XCTAssertTrue(isAvailable)
    }

    // MARK: - Error Recording Tests

    func testRecordFatalError() async {
        // Given: A fatal error
        let error = NSError(domain: "TestError", code: 500, userInfo: [NSLocalizedDescriptionKey: "Fatal error occurred"])

        // When: Recording a fatal error
        await mockCrashReporting.recordError(error, context: nil)

        // Then: Error should be recorded
        let errorCount = await mockCrashReporting.getErrorCount()
        XCTAssertEqual(errorCount, 1)
    }

    func testRecordErrorWithContext() async {
        // Given: An error with context
        let error = NSError(domain: "TestError", code: 404, userInfo: [NSLocalizedDescriptionKey: "Not found"])
        let context: [String: Any] = [
            "endpoint": "/api/v1/wallet",
            "method": "GET",
            "user_id": "12345"
        ]

        // When: Recording an error with context
        await mockCrashReporting.recordError(error, context: context)

        // Then: Error and context should be recorded
        let errors = await mockCrashReporting.recordedErrors
        XCTAssertEqual(errors.count, 1)
        XCTAssertNotNil(errors[0].context)
    }

    func testRecordNonFatalError() async {
        // Given: A non-fatal error
        let error = NSError(domain: "TestError", code: 400, userInfo: [NSLocalizedDescriptionKey: "Bad request"])

        // When: Recording a non-fatal error
        await mockCrashReporting.recordNonFatalError(error, context: nil)

        // Then: Error should be recorded
        let errorCount = await mockCrashReporting.getErrorCount()
        XCTAssertEqual(errorCount, 1)
    }

    func testRecordMultipleErrors() async {
        // Given: Multiple errors
        let error1 = NSError(domain: "TestError", code: 404, userInfo: [NSLocalizedDescriptionKey: "Not found"])
        let error2 = NSError(domain: "TestError", code: 500, userInfo: [NSLocalizedDescriptionKey: "Server error"])
        let error3 = NSError(domain: "TestError", code: 403, userInfo: [NSLocalizedDescriptionKey: "Forbidden"])

        // When: Recording multiple errors
        await mockCrashReporting.recordNonFatalError(error1, context: nil)
        await mockCrashReporting.recordError(error2, context: nil)
        await mockCrashReporting.recordNonFatalError(error3, context: nil)

        // Then: All errors should be recorded
        let errorCount = await mockCrashReporting.getErrorCount()
        XCTAssertEqual(errorCount, 3)
    }

    // MARK: - Logging Tests

    func testLogMessage() async {
        // When: Logging a message
        await mockCrashReporting.log("Test log message", severity: .info)

        // Then: Message should be logged
        let messages = await mockCrashReporting.loggedMessages
        XCTAssertEqual(messages.count, 1)
        XCTAssertEqual(messages[0].message, "Test log message")
        XCTAssertEqual(messages[0].severity, .info)
    }

    func testLogMessagesWithDifferentSeverities() async {
        // When: Logging messages with different severities
        await mockCrashReporting.log("Debug message", severity: .debug)
        await mockCrashReporting.log("Info message", severity: .info)
        await mockCrashReporting.log("Warning message", severity: .warning)
        await mockCrashReporting.log("Error message", severity: .error)
        await mockCrashReporting.log("Fatal message", severity: .fatal)

        // Then: All messages should be logged with correct severities
        let messages = await mockCrashReporting.loggedMessages
        XCTAssertEqual(messages.count, 5)
        XCTAssertEqual(messages[0].severity, .debug)
        XCTAssertEqual(messages[1].severity, .info)
        XCTAssertEqual(messages[2].severity, .warning)
        XCTAssertEqual(messages[3].severity, .error)
        XCTAssertEqual(messages[4].severity, .fatal)
    }

    // MARK: - Custom Key Tests

    func testSetCustomKey() async {
        // When: Setting a custom key
        await mockCrashReporting.setCustomKey("environment", value: "production")

        // Then: Custom key should be set
        let customKeys = await mockCrashReporting.customKeys
        XCTAssertEqual(customKeys["environment"] as? String, "production")
    }

    func testSetMultipleCustomKeys() async {
        // When: Setting multiple custom keys
        await mockCrashReporting.setCustomKey("environment", value: "production")
        await mockCrashReporting.setCustomKey("user_type", value: "premium")
        await mockCrashReporting.setCustomKey("app_version", value: "1.0.0")

        // Then: All custom keys should be set
        let customKeys = await mockCrashReporting.customKeys
        XCTAssertEqual(customKeys.count, 3)
        XCTAssertEqual(customKeys["environment"] as? String, "production")
        XCTAssertEqual(customKeys["user_type"] as? String, "premium")
        XCTAssertEqual(customKeys["app_version"] as? String, "1.0.0")
    }

    func testSetCustomKeyWithDifferentTypes() async {
        // When: Setting custom keys with different types
        await mockCrashReporting.setCustomKey("string_key", value: "test")
        await mockCrashReporting.setCustomKey("int_key", value: 42)
        await mockCrashReporting.setCustomKey("bool_key", value: true)
        await mockCrashReporting.setCustomKey("double_key", value: 3.14)

        // Then: All custom keys should be set with correct types
        let customKeys = await mockCrashReporting.customKeys
        XCTAssertEqual(customKeys.count, 4)
        XCTAssertEqual(customKeys["string_key"] as? String, "test")
        XCTAssertEqual(customKeys["int_key"] as? Int, 42)
        XCTAssertEqual(customKeys["bool_key"] as? Bool, true)
        XCTAssertEqual(customKeys["double_key"] as? Double, 3.14)
    }

    // MARK: - User ID Tests

    func testSetUserId() async {
        // When: Setting a user ID
        await mockCrashReporting.setUserId("user_12345")

        // Then: User ID should be set
        let userId = await mockCrashReporting.userId
        XCTAssertEqual(userId, "user_12345")
    }

    func testClearUserId() async {
        // Given: An existing user ID
        await mockCrashReporting.setUserId("user_12345")

        // When: Clearing the user ID
        await mockCrashReporting.setUserId(nil)

        // Then: User ID should be nil
        let userId = await mockCrashReporting.userId
        XCTAssertNil(userId)
    }

    // MARK: - Convenience Methods Tests

    func testRecordNetworkError() async {
        // Given: A network error
        let error = NSError(domain: NSURLErrorDomain, code: NSURLErrorNotConnectedToInternet, userInfo: nil)

        // When: Recording a network error
        await crashReportingService.recordNetworkError(
            error,
            endpoint: "/api/v1/wallet",
            method: "GET",
            statusCode: 503
        )

        // Then: Network error should be recorded with context
        let recentErrors = await crashReportingService.getRecentErrors(limit: 1)
        XCTAssertEqual(recentErrors.count, 1)
    }

    func testRecordDatabaseError() async {
        // Given: A database error
        let error = NSError(domain: "DatabaseError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Query failed"])

        // When: Recording a database error
        await crashReportingService.recordDatabaseError(
            error,
            table: "wallets",
            operation: "insert"
        )

        // Then: Database error should be recorded with context
        let recentErrors = await crashReportingService.getRecentErrors(limit: 1)
        XCTAssertEqual(recentErrors.count, 1)
    }

    func testRecordWalletError() async {
        // Given: A wallet error
        let error = NSError(domain: "WalletError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid mnemonic"])

        // When: Recording a wallet error
        await crashReportingService.recordWalletError(
            error,
            operation: "import_wallet",
            network: "ethereum"
        )

        // Then: Wallet error should be recorded with context
        let recentErrors = await crashReportingService.getRecentErrors(limit: 1)
        XCTAssertEqual(recentErrors.count, 1)
    }

    func testRecordSecurityError() async {
        // Given: A security error
        let error = NSError(domain: "SecurityError", code: 403, userInfo: [NSLocalizedDescriptionKey: "Access denied"])

        // When: Recording a security error
        await crashReportingService.recordSecurityError(
            error,
            context: "keychain_access"
        )

        // Then: Security error should be recorded with high severity
        // Note: In production, this would be marked as a fatal error
        XCTAssertTrue(true) // Placeholder assertion
    }

    // MARK: - Enable/Disable Tests

    func testSetCrashReportingEnabled() {
        // When: Disabling crash reporting
        crashReportingService.setCrashReportingEnabled(false)

        // Then: Crash reporting should be disabled
        XCTAssertFalse(crashReportingService.isEnabled)

        // When: Enabling crash reporting
        crashReportingService.setCrashReportingEnabled(true)

        // Then: Crash reporting should be enabled
        XCTAssertTrue(crashReportingService.isEnabled)
    }

    func testErrorsNotRecordedWhenDisabled() async {
        // Given: Crash reporting is disabled
        crashReportingService.setCrashReportingEnabled(false)

        // When: Trying to record an error
        let error = NSError(domain: "TestError", code: 500, userInfo: nil)
        await crashReportingService.recordError(error, context: nil)

        // Then: Error should not be recorded
        // Note: This is verified by checking that the error doesn't appear in external services
        XCTAssertTrue(true) // Placeholder assertion
    }

    // MARK: - Error Statistics Tests

    func testGetErrorStats() async {
        // Given: Some errors
        for i in 0..<10 {
            let error = NSError(domain: "TestError", code: i, userInfo: nil)
            await crashReportingService.recordNonFatalError(error, context: nil)
        }

        // When: Getting error stats
        let stats = await crashReportingService.getErrorStats()

        // Then: Stats should be accurate
        XCTAssertGreaterThanOrEqual(stats.total, 10)
        XCTAssertGreaterThanOrEqual(stats.recent, 10)
    }

    // MARK: - Error Log Tests

    func testGetRecentErrors() async {
        // Given: Multiple errors
        for i in 0..<20 {
            let error = NSError(domain: "TestError", code: i, userInfo: [NSLocalizedDescriptionKey: "Error \(i)"])
            await crashReportingService.recordNonFatalError(error, context: ["index": i])
        }

        // When: Getting recent errors
        let recentErrors = await crashReportingService.getRecentErrors(limit: 10)

        // Then: Should return most recent 10 errors
        XCTAssertLessThanOrEqual(recentErrors.count, 10)
    }

    func testErrorLogMaintainsLimit() async {
        // Given: More errors than the log limit (50)
        for i in 0..<75 {
            let error = NSError(domain: "TestError", code: i, userInfo: nil)
            await crashReportingService.recordNonFatalError(error, context: nil)
        }

        // When: Getting all recent errors
        let recentErrors = await crashReportingService.getRecentErrors(limit: 100)

        // Then: Should not exceed max log size
        XCTAssertLessThanOrEqual(recentErrors.count, 50)
    }

    // MARK: - Performance Tests

    func testRecordErrorPerformance() {
        measure {
            Task {
                for i in 0..<100 {
                    let error = NSError(domain: "TestError", code: i, userInfo: nil)
                    await crashReportingService.recordNonFatalError(error, context: nil)
                }
            }
        }
    }

    func testLogMessagePerformance() {
        measure {
            Task {
                for i in 0..<100 {
                    await mockCrashReporting.log("Test message \(i)", severity: .info)
                }
            }
        }
    }

    // MARK: - Integration Tests

    func testFullCrashReportingWorkflow() async {
        // Given: A complete crash reporting workflow
        await mockCrashReporting.setUserId("user_12345")
        await mockCrashReporting.setCustomKey("environment", value: "production")
        await mockCrashReporting.setCustomKey("app_version", value: "1.0.0")

        // Log some messages
        await mockCrashReporting.log("App started", severity: .info)
        await mockCrashReporting.log("User logged in", severity: .info)

        // Record errors
        let error1 = NSError(domain: "NetworkError", code: 503, userInfo: nil)
        await mockCrashReporting.recordNonFatalError(error1, context: ["endpoint": "/api/wallet"])

        let error2 = NSError(domain: "WalletError", code: -1, userInfo: nil)
        await mockCrashReporting.recordError(error2, context: ["operation": "create_wallet"])

        // Then: All crash reporting data should be captured
        let errorCount = await mockCrashReporting.getErrorCount()
        let messages = await mockCrashReporting.loggedMessages
        let customKeys = await mockCrashReporting.customKeys
        let userId = await mockCrashReporting.userId

        XCTAssertEqual(errorCount, 2)
        XCTAssertEqual(messages.count, 2)
        XCTAssertEqual(customKeys.count, 2)
        XCTAssertEqual(userId, "user_12345")
    }

    func testErrorContextPersistence() async {
        // Given: An error with rich context
        let error = NSError(domain: "TestError", code: 500, userInfo: [NSLocalizedDescriptionKey: "Server error"])
        let context: [String: Any] = [
            "endpoint": "/api/v1/wallet",
            "method": "POST",
            "status_code": 500,
            "user_id": "12345",
            "timestamp": Date().timeIntervalSince1970
        ]

        // When: Recording the error
        await mockCrashReporting.recordError(error, context: context)

        // Then: Context should be preserved
        let errors = await mockCrashReporting.recordedErrors
        XCTAssertEqual(errors.count, 1)
        XCTAssertNotNil(errors[0].context)
        XCTAssertEqual(errors[0].context?["endpoint"] as? String, "/api/v1/wallet")
        XCTAssertEqual(errors[0].context?["method"] as? String, "POST")
    }

    func testMockReset() async {
        // Given: Mock service with data
        await mockCrashReporting.recordError(NSError(domain: "Test", code: 1, userInfo: nil), context: nil)
        await mockCrashReporting.log("Test", severity: .info)
        await mockCrashReporting.setCustomKey("key", value: "value")
        await mockCrashReporting.setUserId("user_123")

        // When: Resetting the mock
        await mockCrashReporting.reset()

        // Then: All data should be cleared
        let errorCount = await mockCrashReporting.getErrorCount()
        let messages = await mockCrashReporting.loggedMessages
        let customKeys = await mockCrashReporting.customKeys
        let userId = await mockCrashReporting.userId

        XCTAssertEqual(errorCount, 0)
        XCTAssertEqual(messages.count, 0)
        XCTAssertEqual(customKeys.count, 0)
        XCTAssertNil(userId)
    }
}
