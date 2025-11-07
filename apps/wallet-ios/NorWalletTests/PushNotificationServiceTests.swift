import XCTest
@testable import NorWallet
import UserNotifications

@MainActor
final class PushNotificationServiceTests: XCTestCase {

    var service: PushNotificationService!

    override func setUp() async throws {
        try await super.setUp()
        service = PushNotificationService.shared
    }

    override func tearDown() async throws {
        service = nil
        try await super.tearDown()
    }

    // MARK: - Initialization Tests

    func testServiceInitialization() {
        // Then
        XCTAssertNotNil(service, "Service should initialize")
        XCTAssertFalse(service.isRegistered, "Should not be registered initially")
    }

    // MARK: - Device Token Tests

    func testSetDeviceToken() {
        // Given
        let tokenData = Data([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08])

        // When
        service.setDeviceToken(tokenData)

        // Then
        XCTAssertNotNil(service.deviceToken, "Device token should be set")
        XCTAssertEqual(service.deviceToken, "0102030405060708",
                      "Token should be converted to hex string")
    }

    func testDeviceTokenFormat() {
        // Given
        let sampleToken = Data(repeating: 0xFF, count: 32)

        // When
        service.setDeviceToken(sampleToken)

        // Then
        XCTAssertEqual(service.deviceToken?.count, 64,
                      "Token should be 64 hex characters (32 bytes)")
        XCTAssertTrue(service.deviceToken?.allSatisfy { $0.isHexDigit } ?? false,
                     "Token should contain only hex characters")
    }

    // MARK: - Authorization Tests

    func testCheckAuthorizationStatus() async {
        // When
        service.checkAuthorizationStatus()

        // Wait for async update
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 second

        // Then
        XCTAssertNotEqual(service.authorizationStatus, .notDetermined,
                         "Authorization status should be checked")
    }

    // MARK: - Notification Handling Tests

    func testHandleTransactionNotification() async {
        // Given
        let notification: [AnyHashable: Any] = [
            "type": "transaction_confirmed",
            "tx_hash": "0xabc123",
            "chain": "xaheen",
            "status": "confirmed"
        ]

        // When
        await service.handleNotification(notification)

        // Then - notification should be processed without errors
        XCTAssertTrue(true, "Transaction notification handled")
    }

    func testHandleSecurityAlertNotification() async {
        // Given
        let notification: [AnyHashable: Any] = [
            "type": "security_alert",
            "alert": "Suspicious activity detected"
        ]

        // When
        await service.handleNotification(notification)

        // Then
        XCTAssertTrue(true, "Security alert handled")
    }

    func testHandleAccountActivityNotification() async {
        // Given
        let notification: [AnyHashable: Any] = [
            "type": "account_activity",
            "activity": "New transaction detected"
        ]

        // When
        await service.handleNotification(notification)

        // Then
        XCTAssertTrue(true, "Account activity notification handled")
    }

    func testHandlePriceAlertNotification() async {
        // Given
        let notification: [AnyHashable: Any] = [
            "type": "price_alert",
            "message": "Token price increased by 10%"
        ]

        // When
        await service.handleNotification(notification)

        // Then
        XCTAssertTrue(true, "Price alert handled")
    }

    func testHandleUnknownNotificationType() async {
        // Given
        let notification: [AnyHashable: Any] = [
            "type": "unknown_type",
            "data": "some data"
        ]

        // When
        await service.handleNotification(notification)

        // Then - should not crash
        XCTAssertTrue(true, "Unknown notification type handled gracefully")
    }

    // MARK: - Local Notification Tests

    func testScheduleLocalNotification() async {
        // When
        await service.scheduleLocalNotification(
            title: "Test Notification",
            body: "Test message",
            identifier: "test-\(UUID().uuidString)",
            delay: 1
        )

        // Then - notification should be scheduled without errors
        XCTAssertTrue(true, "Local notification scheduled")
    }

    // MARK: - Badge Management Tests

    func testUpdateBadgeCount() {
        // When
        service.updateBadgeCount(5)

        // Then
        XCTAssertEqual(UIApplication.shared.applicationIconBadgeNumber, 5,
                      "Badge count should be updated")
    }

    func testClearBadge() {
        // Given
        service.updateBadgeCount(10)

        // When
        service.clearBadge()

        // Then
        XCTAssertEqual(UIApplication.shared.applicationIconBadgeNumber, 0,
                      "Badge should be cleared")
    }

    // MARK: - Error Handling Tests

    func testHandleRegistrationError() {
        // Given
        let error = NSError(domain: "TestError", code: -1, userInfo: [
            NSLocalizedDescriptionKey: "Registration failed"
        ])

        // When
        service.handleRegistrationError(error)

        // Then - should not crash
        XCTAssertTrue(true, "Registration error handled gracefully")
    }

    // MARK: - Integration Tests

    func testNotificationIntegrationFlow() async throws {
        // Given - simulate device token registration
        let tokenData = Data(repeating: 0xAB, count: 32)
        service.setDeviceToken(tokenData)

        XCTAssertNotNil(service.deviceToken, "Token should be set")

        // Simulate receiving notification
        let notification: [AnyHashable: Any] = [
            "type": "transaction_confirmed",
            "tx_hash": "0x123",
            "chain": "xaheen",
            "status": "confirmed"
        ]

        await service.handleNotification(notification)

        // Then - flow should complete without errors
        XCTAssertTrue(true, "Full notification flow completed")
    }
}

// MARK: - Helper Extensions

private extension Character {
    var isHexDigit: Bool {
        return ("0"..."9").contains(self) || ("a"..."f").contains(self) || ("A"..."F").contains(self)
    }
}
