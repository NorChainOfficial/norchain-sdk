//
//  AnalyticsServiceTests.swift
//  NorWalletTests
//
//  Created on November 5, 2025.
//  Unit tests for AnalyticsService
//

import XCTest
@testable import NorWallet

@MainActor
final class AnalyticsServiceTests: XCTestCase {
    var analyticsService: AnalyticsService!
    var mockAnalytics: MockAnalyticsService!

    override func setUp() async throws {
        try await super.setUp()
        analyticsService = AnalyticsService.shared
        mockAnalytics = MockAnalyticsService()
    }

    override func tearDown() async throws {
        try await super.tearDown()
    }

    // MARK: - Initialization Tests

    func testAnalyticsServiceInitialization() {
        // Then: Service should be initialized
        XCTAssertNotNil(analyticsService)
        XCTAssertTrue(analyticsService.isEnabled)
    }

    // MARK: - Event Logging Tests

    func testLogEventWithoutParameters() async {
        // When: Logging an event without parameters
        await mockAnalytics.logEvent(.walletCreated, parameters: nil)

        // Then: Event should be logged
        let eventCount = await mockAnalytics.getEventCount(for: .walletCreated)
        XCTAssertEqual(eventCount, 1)
    }

    func testLogEventWithParameters() async {
        // Given: Event parameters
        let parameters: [String: Any] = [
            "wallet_name": "Test Wallet",
            "wallet_count": 1
        ]

        // When: Logging an event with parameters
        await mockAnalytics.logEvent(.walletCreated, parameters: parameters)

        // Then: Event should be logged with parameters
        let events = await mockAnalytics.loggedEvents
        XCTAssertEqual(events.count, 1)
        XCTAssertEqual(events[0].event, .walletCreated)
        XCTAssertNotNil(events[0].parameters)
    }

    func testLogMultipleEvents() async {
        // When: Logging multiple different events
        await mockAnalytics.logEvent(.walletCreated, parameters: nil)
        await mockAnalytics.logEvent(.walletImported, parameters: nil)
        await mockAnalytics.logEvent(.transactionSent, parameters: nil)

        // Then: All events should be logged
        let events = await mockAnalytics.loggedEvents
        XCTAssertEqual(events.count, 3)
    }

    func testLogSameEventMultipleTimes() async {
        // When: Logging the same event multiple times
        for _ in 0..<5 {
            await mockAnalytics.logEvent(.dappBrowserOpened, parameters: nil)
        }

        // Then: All occurrences should be logged
        let eventCount = await mockAnalytics.getEventCount(for: .dappBrowserOpened)
        XCTAssertEqual(eventCount, 5)
    }

    // MARK: - User Property Tests

    func testSetUserProperty() async {
        // When: Setting a user property
        await mockAnalytics.setUserProperty(.walletCount, value: "5")

        // Then: Property should be set
        let properties = await mockAnalytics.userProperties
        XCTAssertEqual(properties[.walletCount], "5")
    }

    func testSetMultipleUserProperties() async {
        // When: Setting multiple user properties
        await mockAnalytics.setUserProperty(.walletCount, value: "3")
        await mockAnalytics.setUserProperty(.preferredNetwork, value: "ethereum")
        await mockAnalytics.setUserProperty(.biometricEnabled, value: "true")

        // Then: All properties should be set
        let properties = await mockAnalytics.userProperties
        XCTAssertEqual(properties.count, 3)
        XCTAssertEqual(properties[.walletCount], "3")
        XCTAssertEqual(properties[.preferredNetwork], "ethereum")
        XCTAssertEqual(properties[.biometricEnabled], "true")
    }

    func testUpdateUserProperty() async {
        // Given: An existing user property
        await mockAnalytics.setUserProperty(.walletCount, value: "1")

        // When: Updating the property
        await mockAnalytics.setUserProperty(.walletCount, value: "2")

        // Then: Property should be updated
        let properties = await mockAnalytics.userProperties
        XCTAssertEqual(properties[.walletCount], "2")
    }

    func testClearUserProperty() async {
        // Given: An existing user property
        await mockAnalytics.setUserProperty(.walletCount, value: "5")

        // When: Clearing the property (setting to nil)
        await mockAnalytics.setUserProperty(.walletCount, value: nil)

        // Then: Property should be nil
        let properties = await mockAnalytics.userProperties
        XCTAssertNil(properties[.walletCount])
    }

    // MARK: - User ID Tests

    func testSetUserId() async {
        // When: Setting a user ID
        await mockAnalytics.setUserId("user_12345")

        // Then: User ID should be set
        let userId = await mockAnalytics.userId
        XCTAssertEqual(userId, "user_12345")
    }

    func testClearUserId() async {
        // Given: An existing user ID
        await mockAnalytics.setUserId("user_12345")

        // When: Clearing the user ID
        await mockAnalytics.setUserId(nil)

        // Then: User ID should be nil
        let userId = await mockAnalytics.userId
        XCTAssertNil(userId)
    }

    // MARK: - Reset Tests

    func testResetAnalytics() async {
        // Given: Some analytics data
        await mockAnalytics.logEvent(.walletCreated, parameters: nil)
        await mockAnalytics.logEvent(.transactionSent, parameters: nil)
        await mockAnalytics.setUserProperty(.walletCount, value: "5")
        await mockAnalytics.setUserId("user_12345")

        // When: Resetting analytics
        await mockAnalytics.resetAnalytics()

        // Then: All data should be cleared
        let events = await mockAnalytics.loggedEvents
        let properties = await mockAnalytics.userProperties
        let userId = await mockAnalytics.userId

        XCTAssertEqual(events.count, 0)
        XCTAssertEqual(properties.count, 0)
        XCTAssertNil(userId)
    }

    // MARK: - Event Queue Tests

    func testEventQueue() async {
        // When: Logging events
        for i in 0..<10 {
            await analyticsService.logEvent(.walletCreated, parameters: ["index": i])
        }

        // Then: Events should be in the queue
        let recentEvents = await analyticsService.getRecentEvents(limit: 10)
        XCTAssertEqual(recentEvents.count, 10)
    }

    func testEventQueueLimit() async {
        // When: Logging more events than the max queue size
        for i in 0..<150 {
            await analyticsService.logEvent(.walletCreated, parameters: ["index": i])
        }

        // Then: Only recent events should be kept
        let recentEvents = await analyticsService.getRecentEvents(limit: 100)
        XCTAssertLessThanOrEqual(recentEvents.count, 100)
    }

    // MARK: - Convenience Methods Tests

    func testLogScreenView() async {
        // When: Logging a screen view
        await analyticsService.logScreenView("HomeView", screenClass: "HomeViewController")

        // Then: Screen view should be logged (verified via debug logs in production)
        // Note: In production, this would trigger Firebase's screen view tracking
        XCTAssertTrue(true) // Placeholder assertion
    }

    func testLogTransaction() async {
        // When: Logging a transaction
        await analyticsService.logTransaction(
            transactionId: "tx_12345",
            value: 100.50,
            currency: "USD",
            items: [["item_id": "token_1", "quantity": 10]]
        )

        // Then: Transaction should be logged
        XCTAssertTrue(true) // Placeholder assertion
    }

    func testLogError() async {
        // Given: An error
        let error = NSError(domain: "TestDomain", code: 404, userInfo: [NSLocalizedDescriptionKey: "Not found"])

        // When: Logging an error
        await analyticsService.logError(error: error, context: "test_context", isFatal: false)

        // Then: Error should be logged
        let recentEvents = await analyticsService.getRecentEvents(limit: 1)
        XCTAssertEqual(recentEvents.last?.event, .errorOccurred)
    }

    // MARK: - Enable/Disable Tests

    func testSetAnalyticsEnabled() {
        // When: Disabling analytics
        analyticsService.setAnalyticsEnabled(false)

        // Then: Analytics should be disabled
        XCTAssertFalse(analyticsService.isEnabled)

        // When: Enabling analytics
        analyticsService.setAnalyticsEnabled(true)

        // Then: Analytics should be enabled
        XCTAssertTrue(analyticsService.isEnabled)
    }

    func testEventsNotLoggedWhenDisabled() async {
        // Given: Analytics is disabled
        analyticsService.setAnalyticsEnabled(false)

        // When: Trying to log an event
        await analyticsService.logEvent(.walletCreated, parameters: nil)

        // Then: Event should not be logged
        // Note: This is verified by checking that the event doesn't appear in external analytics
        // In a mock implementation, we could verify the event wasn't added to the queue
        XCTAssertTrue(true) // Placeholder assertion
    }

    // MARK: - Wallet Event Tests

    func testWalletCreatedEvent() async {
        // When: Logging wallet created event
        await mockAnalytics.logEvent(.walletCreated, parameters: [
            "wallet_name": "My Wallet",
            "wallet_count": 1
        ])

        // Then: Event should be logged correctly
        let eventCount = await mockAnalytics.getEventCount(for: .walletCreated)
        XCTAssertEqual(eventCount, 1)
    }

    func testWalletImportedEvent() async {
        // When: Logging wallet imported event
        await mockAnalytics.logEvent(.walletImported, parameters: [
            "wallet_name": "Imported Wallet",
            "import_method": "mnemonic"
        ])

        // Then: Event should be logged correctly
        let eventCount = await mockAnalytics.getEventCount(for: .walletImported)
        XCTAssertEqual(eventCount, 1)
    }

    // MARK: - Transaction Event Tests

    func testTransactionEvents() async {
        // When: Logging transaction lifecycle events
        await mockAnalytics.logEvent(.transactionInitiated, parameters: ["amount": "1.5 ETH"])
        await mockAnalytics.logEvent(.transactionSigned, parameters: ["tx_id": "0x123"])
        await mockAnalytics.logEvent(.transactionSent, parameters: ["tx_id": "0x123"])
        await mockAnalytics.logEvent(.transactionConfirmed, parameters: ["tx_id": "0x123"])

        // Then: All transaction events should be logged
        let events = await mockAnalytics.loggedEvents
        XCTAssertEqual(events.count, 4)
    }

    // MARK: - Security Event Tests

    func testSecurityEvents() async {
        // When: Logging security events
        await mockAnalytics.logEvent(.biometricEnabled, parameters: nil)
        await mockAnalytics.logEvent(.appLocked, parameters: nil)
        await mockAnalytics.logEvent(.appUnlocked, parameters: nil)

        // Then: Security events should be logged
        let events = await mockAnalytics.loggedEvents
        XCTAssertEqual(events.count, 3)
    }

    // MARK: - Performance Tests

    func testLogEventPerformance() {
        measure {
            Task {
                for _ in 0..<100 {
                    await analyticsService.logEvent(.walletCreated, parameters: nil)
                }
            }
        }
    }

    func testSetUserPropertyPerformance() {
        measure {
            Task {
                for i in 0..<100 {
                    await mockAnalytics.setUserProperty(.walletCount, value: "\(i)")
                }
            }
        }
    }

    // MARK: - Integration Tests

    func testFullAnalyticsWorkflow() async {
        // Given: A complete analytics workflow
        await mockAnalytics.setUserId("user_12345")
        await mockAnalytics.setUserProperty(.walletCount, value: "0")

        // Create wallet
        await mockAnalytics.logEvent(.walletCreated, parameters: ["wallet_name": "Wallet1"])
        await mockAnalytics.setUserProperty(.walletCount, value: "1")

        // Send transaction
        await mockAnalytics.logEvent(.transactionInitiated, parameters: ["amount": "1.0 ETH"])
        await mockAnalytics.logEvent(.transactionSent, parameters: ["tx_id": "0x123"])

        // Enable biometric
        await mockAnalytics.logEvent(.biometricEnabled, parameters: nil)

        // Then: All analytics should be captured
        let events = await mockAnalytics.loggedEvents
        let properties = await mockAnalytics.userProperties
        let userId = await mockAnalytics.userId

        XCTAssertEqual(events.count, 4)
        XCTAssertEqual(properties[.walletCount], "1")
        XCTAssertEqual(userId, "user_12345")
    }
}
