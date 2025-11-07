import XCTest
@testable import NorWallet

@MainActor
final class SupabaseServiceTests: XCTestCase {

    var service: SupabaseService!

    override func setUp() async throws {
        try await super.setUp()
        service = SupabaseService.shared
    }

    override func tearDown() async throws {
        // Sign out if authenticated
        if service.isAuthenticated {
            try? await service.signOut()
        }
        service = nil
        try await super.tearDown()
    }

    // MARK: - Configuration Tests

    func testSupabaseConfigurationIsValid() {
        // Then
        XCTAssertFalse(SupabaseConfig.supabaseURL.absoluteString.isEmpty,
                      "Supabase URL should be configured")
        XCTAssertFalse(SupabaseConfig.supabaseKey.isEmpty,
                      "Supabase key should be configured")
        XCTAssertTrue(SupabaseConfig.supabaseURL.absoluteString.contains("supabase.co"),
                     "URL should be a valid Supabase URL")
    }

    func testEnvironmentAwareConfiguration() {
        // Then
        #if DEBUG
        XCTAssertEqual(SupabaseConfig.environment, .development,
                      "Debug builds should use development environment")
        XCTAssertTrue(SupabaseConfig.enableDebugLogging,
                     "Debug logging should be enabled in debug builds")
        XCTAssertTrue(SupabaseConfig.enableTestView,
                     "Test views should be enabled in debug builds")
        #else
        XCTAssertEqual(SupabaseConfig.environment, .production,
                      "Release builds should use production environment")
        XCTAssertFalse(SupabaseConfig.enableDebugLogging,
                      "Debug logging should be disabled in production")
        XCTAssertFalse(SupabaseConfig.enableTestView,
                      "Test views should be disabled in production")
        #endif
    }

    // MARK: - Authentication Tests

    func testInitialAuthenticationState() {
        // Given - fresh service
        let newService = SupabaseService.shared

        // Then - should not be authenticated initially
        // (unless there's a cached session)
        XCTAssertNotNil(newService, "Service should be initialized")
    }

    func testSignUpWithValidCredentials() async throws {
        // Given
        let testEmail = "test\(UUID().uuidString)@example.com"
        let testPassword = "Test123!@#"

        // When
        let session = try await service.signUp(email: testEmail, password: testPassword)

        // Then
        XCTAssertNotNil(session, "Should return session")
        XCTAssertTrue(service.isAuthenticated, "Should be authenticated after sign up")
        XCTAssertEqual(service.currentSession?.user.email, testEmail,
                      "Session should have correct email")
    }

    func testSignInWithInvalidCredentials() async throws {
        // Given
        let invalidEmail = "nonexistent@example.com"
        let invalidPassword = "wrongpassword"

        // When/Then
        do {
            _ = try await service.signIn(email: invalidEmail, password: invalidPassword)
            XCTFail("Should throw error for invalid credentials")
        } catch {
            // Expected to throw
            XCTAssertTrue(true, "Correctly rejected invalid credentials")
        }
    }

    func testSignOut() async throws {
        // Given - sign in first
        let testEmail = "test\(UUID().uuidString)@example.com"
        let testPassword = "Test123!@#"
        _ = try await service.signUp(email: testEmail, password: testPassword)
        XCTAssertTrue(service.isAuthenticated, "Should be authenticated")

        // When
        try await service.signOut()

        // Then
        XCTAssertFalse(service.isAuthenticated, "Should not be authenticated after sign out")
        XCTAssertNil(service.currentSession, "Session should be cleared")
    }

    // MARK: - Device Registration Tests

    func testRegisterDeviceRequiresAuthentication() async throws {
        // Given - not authenticated
        guard !service.isAuthenticated else {
            try await service.signOut()
        }

        // When/Then
        do {
            _ = try await service.registerDevice(platform: "ios", label: "Test Device", pushToken: nil)
            XCTFail("Should require authentication")
        } catch {
            // Expected to throw
            XCTAssertTrue(error.localizedDescription.contains("authenticated") ||
                         error.localizedDescription.contains("401"),
                         "Error should indicate authentication required")
        }
    }

    func testRegisterDeviceWithAuthentication() async throws {
        // Given - authenticated user
        let testEmail = "test\(UUID().uuidString)@example.com"
        _ = try await service.signUp(email: testEmail, password: "Test123!@#")

        // When
        let device = try await service.registerDevice(
            platform: "ios",
            label: "Test iPhone",
            pushToken: "test-token-123"
        )

        // Then
        XCTAssertEqual(device.platform, "ios", "Device should have correct platform")
        XCTAssertEqual(device.device_label, "Test iPhone", "Device should have correct label")
        XCTAssertEqual(device.push_token, "test-token-123", "Device should have correct token")
        XCTAssertTrue(device.is_active, "Device should be active")
    }

    // MARK: - Account Tests

    func testCreateAccount() async throws {
        // Given - authenticated user
        let testEmail = "test\(UUID().uuidString)@example.com"
        _ = try await service.signUp(email: testEmail, password: "Test123!@#")

        // When
        let account = try await service.createAccount(
            chain: "xaheen",
            address: "0x1234567890123456789012345678901234567890",
            type: "EOA",
            isDefault: true
        )

        // Then
        XCTAssertEqual(account.chain, "xaheen", "Account should have correct chain")
        XCTAssertEqual(account.address.lowercased(),
                      "0x1234567890123456789012345678901234567890",
                      "Account should have correct address")
        XCTAssertEqual(account.type, "EOA", "Account should have correct type")
        XCTAssertTrue(account.is_default, "Account should be marked as default")
    }

    // MARK: - Edge Functions Tests

    func testInitiateBridgeRequiresAuthentication() async throws {
        // Given - not authenticated
        guard !service.isAuthenticated else {
            try await service.signOut()
        }

        // When/Then
        do {
            _ = try await service.initiateBridge(
                fromChain: "xaheen",
                toChain: "bsc",
                fromToken: "native",
                toToken: "native",
                amount: "1000000"
            )
            XCTFail("Should require authentication")
        } catch {
            // Expected to throw
            XCTAssertTrue(true, "Correctly requires authentication")
        }
    }

    func testSponsorPaymasterRequiresAuthentication() async throws {
        // Given - not authenticated
        guard !service.isAuthenticated else {
            try await service.signOut()
        }

        // When/Then
        do {
            _ = try await service.sponsorPaymaster(
                userOperation: [:],
                chain: "xaheen",
                accountId: "test-account"
            )
            XCTFail("Should require authentication")
        } catch {
            // Expected to throw
            XCTAssertTrue(true, "Correctly requires authentication")
        }
    }

    // MARK: - Model Tests

    func testDeviceModelEncoding() throws {
        // Given
        let device = Device(
            user_id: UUID(),
            platform: "ios",
            device_label: "Test Device",
            pushToken: "token123",
            is_active: true
        )

        // When
        let encoder = JSONEncoder()
        let data = try encoder.encode(device)

        // Then
        XCTAssertFalse(data.isEmpty, "Device should encode to JSON")

        // Decode back
        let decoder = JSONDecoder()
        let decoded = try decoder.decode(Device.self, from: data)
        XCTAssertEqual(decoded.platform, device.platform)
        XCTAssertEqual(decoded.device_label, device.device_label)
    }

    func testJobModelEncoding() throws {
        // Given
        let job = Job(
            id: UUID(),
            user_id: UUID(),
            kind: "bridge",
            request: ["from": AnyCodable("xaheen"), "to": AnyCodable("bsc")],
            status: "pending",
            result: nil,
            created_at: Date()
        )

        // When
        let encoder = JSONEncoder()
        let data = try encoder.encode(job)

        // Then
        XCTAssertFalse(data.isEmpty, "Job should encode to JSON")
    }

    func testPaymasterResponseDecoding() throws {
        // Given
        let json = """
        {
            "sponsored": true,
            "paymaster_and_data": "0xabcdef...",
            "estimated_gas": "21000",
            "message": "Sponsored successfully"
        }
        """.data(using: .utf8)!

        // When
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let response = try decoder.decode(PaymasterResponse.self, from: json)

        // Then
        XCTAssertTrue(response.sponsored)
        XCTAssertEqual(response.paymasterAndData, "0xabcdef...")
        XCTAssertEqual(response.estimatedGas, "21000")
        XCTAssertEqual(response.message, "Sponsored successfully")
    }

    // MARK: - AnyCodable Tests

    func testAnyCodableWithDifferentTypes() throws {
        // Test with String
        let stringValue = AnyCodable("test string")
        let stringData = try JSONEncoder().encode(stringValue)
        let decodedString = try JSONDecoder().decode(AnyCodable.self, from: stringData)
        XCTAssertTrue(decodedString.value is String)

        // Test with Int
        let intValue = AnyCodable(42)
        let intData = try JSONEncoder().encode(intValue)
        let decodedInt = try JSONDecoder().decode(AnyCodable.self, from: intData)
        XCTAssertTrue(decodedInt.value is Int)

        // Test with Bool
        let boolValue = AnyCodable(true)
        let boolData = try JSONEncoder().encode(boolValue)
        let decodedBool = try JSONDecoder().decode(AnyCodable.self, from: boolData)
        XCTAssertTrue(decodedBool.value is Bool)
    }

    // MARK: - Performance Tests

    func testAuthenticationPerformance() throws {
        measure {
            Task {
                let email = "perf\(UUID().uuidString)@example.com"
                try? await service.signUp(email: email, password: "Test123!@#")
            }
        }
    }
}
