//
//  KeychainServiceTests.swift
//  NorWalletTests
//
//  Created on November 5, 2025.
//  Unit tests for KeychainService secure storage
//

import XCTest
@testable import NorWallet

@MainActor
final class KeychainServiceTests: XCTestCase {
    var keychainService: KeychainService!
    let testKey = "test_keychain_key"
    let testData = "Test Data 12345".data(using: .utf8)!

    override func setUp() async throws {
        try await super.setUp()
        keychainService = KeychainService.shared

        // Clean up any existing test data
        try? keychainService.delete(forKey: testKey)
    }

    override func tearDown() async throws {
        // Clean up test data
        try? keychainService.delete(forKey: testKey)
        try await super.tearDown()
    }

    // MARK: - Basic Operations Tests

    func testSaveData() throws {
        // When: Saving data to Keychain
        try keychainService.save(testData, forKey: testKey)

        // Then: Data should be saved successfully
        let loadedData = try keychainService.load(forKey: testKey)
        XCTAssertEqual(loadedData, testData)
    }

    func testLoadNonExistentKey() throws {
        // When: Loading data that doesn't exist
        let loadedData = try keychainService.load(forKey: "non_existent_key")

        // Then: Should return nil
        XCTAssertNil(loadedData)
    }

    func testDeleteData() throws {
        // Given: Data is saved
        try keychainService.save(testData, forKey: testKey)

        // When: Deleting the data
        try keychainService.delete(forKey: testKey)

        // Then: Data should no longer exist
        let loadedData = try keychainService.load(forKey: testKey)
        XCTAssertNil(loadedData)
    }

    func testDeleteNonExistentKey() throws {
        // When: Deleting a key that doesn't exist
        // Then: Should not throw an error
        XCTAssertNoThrow(try keychainService.delete(forKey: "non_existent_key"))
    }

    func testUpdateData() throws {
        // Given: Initial data is saved
        try keychainService.save(testData, forKey: testKey)

        // When: Updating with new data
        let newData = "Updated Data 67890".data(using: .utf8)!
        try keychainService.update(newData, forKey: testKey)

        // Then: Data should be updated
        let loadedData = try keychainService.load(forKey: testKey)
        XCTAssertEqual(loadedData, newData)
        XCTAssertNotEqual(loadedData, testData)
    }

    func testUpdateNonExistentKey() throws {
        // When: Updating a key that doesn't exist
        let newData = "New Data".data(using: .utf8)!
        try keychainService.update(newData, forKey: testKey)

        // Then: Data should be created
        let loadedData = try keychainService.load(forKey: testKey)
        XCTAssertEqual(loadedData, newData)
    }

    func testOverwriteData() throws {
        // Given: Data already exists
        try keychainService.save(testData, forKey: testKey)

        // When: Saving new data with the same key
        let newData = "Overwritten Data".data(using: .utf8)!
        try keychainService.save(newData, forKey: testKey)

        // Then: New data should replace old data
        let loadedData = try keychainService.load(forKey: testKey)
        XCTAssertEqual(loadedData, newData)
    }

    // MARK: - Codable Tests

    func testSaveCodableObject() throws {
        // Given: A Codable struct
        struct TestModel: Codable, Equatable {
            let id: String
            let name: String
            let value: Int
        }

        let testModel = TestModel(id: "123", name: "Test", value: 42)

        // When: Saving Codable object
        try keychainService.save(testModel, forKey: testKey)

        // Then: Object should be saved and loadable
        let loadedModel = try keychainService.load(TestModel.self, forKey: testKey)
        XCTAssertEqual(loadedModel, testModel)
    }

    func testLoadCodableObject() throws {
        // Given: A Codable array
        struct Item: Codable, Equatable {
            let title: String
            let count: Int
        }

        let items = [
            Item(title: "First", count: 10),
            Item(title: "Second", count: 20),
            Item(title: "Third", count: 30)
        ]

        try keychainService.save(items, forKey: testKey)

        // When: Loading Codable array
        let loadedItems = try keychainService.load([Item].self, forKey: testKey)

        // Then: Array should match
        XCTAssertEqual(loadedItems, items)
        XCTAssertEqual(loadedItems?.count, 3)
    }

    func testUpdateCodableObject() throws {
        // Given: Initial Codable object
        struct Config: Codable, Equatable {
            let enabled: Bool
            let timeout: Int
        }

        let initialConfig = Config(enabled: false, timeout: 30)
        try keychainService.save(initialConfig, forKey: testKey)

        // When: Updating with new config
        let newConfig = Config(enabled: true, timeout: 60)
        try keychainService.update(newConfig, forKey: testKey)

        // Then: Config should be updated
        let loadedConfig = try keychainService.load(Config.self, forKey: testKey)
        XCTAssertEqual(loadedConfig, newConfig)
        XCTAssertNotEqual(loadedConfig, initialConfig)
    }

    func testLoadNonExistentCodableObject() throws {
        // Given: A type to decode
        struct TestModel: Codable {
            let value: String
        }

        // When: Loading non-existent object
        let loadedModel = try keychainService.load(TestModel.self, forKey: "non_existent_key")

        // Then: Should return nil
        XCTAssertNil(loadedModel)
    }

    // MARK: - Complex Data Tests

    func testSaveLargeData() throws {
        // Given: Large data (10KB)
        let largeString = String(repeating: "A", count: 10_000)
        let largeData = largeString.data(using: .utf8)!

        // When: Saving large data
        try keychainService.save(largeData, forKey: testKey)

        // Then: Data should be saved and loadable
        let loadedData = try keychainService.load(forKey: testKey)
        XCTAssertEqual(loadedData, largeData)
        XCTAssertEqual(loadedData?.count, 10_000)
    }

    func testSaveEmptyData() throws {
        // Given: Empty data
        let emptyData = Data()

        // When: Saving empty data
        try keychainService.save(emptyData, forKey: testKey)

        // Then: Empty data should be saved
        let loadedData = try keychainService.load(forKey: testKey)
        XCTAssertEqual(loadedData, emptyData)
        XCTAssertEqual(loadedData?.count, 0)
    }

    func testSaveSpecialCharacters() throws {
        // Given: Data with special characters
        let specialString = "Test 🔐 KeyChain 🗝️ with émojis and spëcial çhars"
        let specialData = specialString.data(using: .utf8)!

        // When: Saving data with special characters
        try keychainService.save(specialData, forKey: testKey)

        // Then: Data should be preserved correctly
        let loadedData = try keychainService.load(forKey: testKey)
        let loadedString = String(data: loadedData!, encoding: .utf8)
        XCTAssertEqual(loadedString, specialString)
    }

    // MARK: - Migration Tests

    func testMigrateFromUserDefaults() {
        // Given: Data in UserDefaults
        let userDefaultsKey = "migration_test_key"
        let migrationData = "Migration Test Data".data(using: .utf8)!
        UserDefaults.standard.set(migrationData, forKey: userDefaultsKey)

        // When: Migrating to Keychain
        let success = keychainService.migrateFromUserDefaults(key: userDefaultsKey)

        // Then: Migration should succeed
        XCTAssertTrue(success)

        // And: Data should be in Keychain
        let keychainData = try? keychainService.load(forKey: userDefaultsKey)
        XCTAssertEqual(keychainData, migrationData)

        // And: Data should be removed from UserDefaults
        let userDefaultsData = UserDefaults.standard.data(forKey: userDefaultsKey)
        XCTAssertNil(userDefaultsData)

        // Cleanup
        try? keychainService.delete(forKey: userDefaultsKey)
    }

    func testMigrateAlreadyMigrated() throws {
        // Given: Data already in Keychain
        let migrationKey = "already_migrated_key"
        try keychainService.save(testData, forKey: migrationKey)

        // When: Attempting to migrate again
        let success = keychainService.migrateFromUserDefaults(key: migrationKey)

        // Then: Should succeed without duplicating
        XCTAssertTrue(success)

        let keychainData = try keychainService.load(forKey: migrationKey)
        XCTAssertEqual(keychainData, testData)

        // Cleanup
        try keychainService.delete(forKey: migrationKey)
    }

    func testMigrateNonExistentUserDefaultsKey() {
        // Given: No data in UserDefaults
        let nonExistentKey = "non_existent_migration_key"

        // When: Attempting to migrate
        let success = keychainService.migrateFromUserDefaults(key: nonExistentKey)

        // Then: Should succeed (nothing to migrate)
        XCTAssertTrue(success)

        // And: No data in Keychain
        let keychainData = try? keychainService.load(forKey: nonExistentKey)
        XCTAssertNil(keychainData)
    }

    // MARK: - Clear All Tests

    func testClearAll() throws {
        // Given: Multiple items in Keychain
        let key1 = "test_key_1"
        let key2 = "test_key_2"
        let key3 = "test_key_3"

        try keychainService.save(testData, forKey: key1)
        try keychainService.save(testData, forKey: key2)
        try keychainService.save(testData, forKey: key3)

        // When: Clearing all data
        try keychainService.clearAll()

        // Then: All items should be deleted
        XCTAssertNil(try keychainService.load(forKey: key1))
        XCTAssertNil(try keychainService.load(forKey: key2))
        XCTAssertNil(try keychainService.load(forKey: key3))
    }

    func testClearAllEmptyKeychain() throws {
        // When: Clearing empty Keychain
        // Then: Should not throw error
        XCTAssertNoThrow(try keychainService.clearAll())
    }

    // MARK: - Error Handling Tests

    func testErrorDescription() {
        // Given: Keychain errors
        let saveError = KeychainError.saveFailed(status: -25300)
        let loadError = KeychainError.loadFailed(status: -25308)
        let deleteError = KeychainError.deleteFailed(status: -25291)
        let invalidDataError = KeychainError.invalidData

        // Then: Error descriptions should be meaningful
        XCTAssertNotNil(saveError.errorDescription)
        XCTAssertNotNil(loadError.errorDescription)
        XCTAssertNotNil(deleteError.errorDescription)
        XCTAssertNotNil(invalidDataError.errorDescription)

        XCTAssertTrue(saveError.errorDescription!.contains("save"))
        XCTAssertTrue(loadError.errorDescription!.contains("load"))
        XCTAssertTrue(deleteError.errorDescription!.contains("delete"))
        XCTAssertTrue(invalidDataError.errorDescription!.contains("Invalid"))
    }

    func testRecoverySuggestions() {
        // Given: Keychain errors
        let saveError = KeychainError.saveFailed(status: -25300)
        let loadError = KeychainError.loadFailed(status: -25308)
        let invalidDataError = KeychainError.invalidData

        // Then: Recovery suggestions should exist
        XCTAssertNotNil(saveError.recoverySuggestion)
        XCTAssertNotNil(loadError.recoverySuggestion)
        XCTAssertNotNil(invalidDataError.recoverySuggestion)
    }

    // MARK: - Performance Tests

    func testSavePerformance() {
        measure {
            for i in 0..<100 {
                let key = "perf_test_\(i)"
                try? keychainService.save(testData, forKey: key)
                try? keychainService.delete(forKey: key)
            }
        }
    }

    func testLoadPerformance() {
        // Given: Data is saved
        try? keychainService.save(testData, forKey: testKey)

        measure {
            for _ in 0..<100 {
                _ = try? keychainService.load(forKey: testKey)
            }
        }
    }

    func testCodablePerformance() {
        // Given: Complex Codable structure
        struct ComplexModel: Codable {
            let id: String
            let values: [Int]
            let metadata: [String: String]
        }

        let model = ComplexModel(
            id: UUID().uuidString,
            values: Array(0..<100),
            metadata: ["key1": "value1", "key2": "value2", "key3": "value3"]
        )

        measure {
            for i in 0..<50 {
                let key = "complex_perf_\(i)"
                try? keychainService.save(model, forKey: key)
                _ = try? keychainService.load(ComplexModel.self, forKey: key)
                try? keychainService.delete(forKey: key)
            }
        }
    }

    // MARK: - Integration Tests

    func testFullWorkflow() throws {
        // Create
        try keychainService.save(testData, forKey: testKey)
        var loadedData = try keychainService.load(forKey: testKey)
        XCTAssertEqual(loadedData, testData)

        // Update
        let newData = "Updated".data(using: .utf8)!
        try keychainService.update(newData, forKey: testKey)
        loadedData = try keychainService.load(forKey: testKey)
        XCTAssertEqual(loadedData, newData)

        // Delete
        try keychainService.delete(forKey: testKey)
        loadedData = try keychainService.load(forKey: testKey)
        XCTAssertNil(loadedData)
    }

    func testMultipleKeys() throws {
        // Given: Multiple different keys
        let keys = ["key1", "key2", "key3", "key4", "key5"]
        let dataValues = keys.map { "\($0)_data".data(using: .utf8)! }

        // When: Saving multiple keys
        for (key, data) in zip(keys, dataValues) {
            try keychainService.save(data, forKey: key)
        }

        // Then: All keys should be retrievable
        for (key, expectedData) in zip(keys, dataValues) {
            let loadedData = try keychainService.load(forKey: key)
            XCTAssertEqual(loadedData, expectedData)
        }

        // Cleanup
        for key in keys {
            try keychainService.delete(forKey: key)
        }
    }
}
