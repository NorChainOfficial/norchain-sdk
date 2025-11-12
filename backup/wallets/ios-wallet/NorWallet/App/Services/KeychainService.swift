//
//  KeychainService.swift
//  NorWallet
//
//  Created on November 5, 2025.
//  Secure Keychain storage for sensitive wallet data
//

import Foundation
import Security

/// Secure Keychain storage service for wallet data
/// Replaces UserDefaults with production-grade security
@MainActor
class KeychainService {
    static let shared = KeychainService()

    private let serviceName = "com.norwallet.keychain"

    private init() {}

    // MARK: - Public API

    /// Save data securely to Keychain
    /// - Parameters:
    ///   - data: Data to store
    ///   - key: Unique identifier for the data
    /// - Throws: KeychainError if operation fails
    func save(_ data: Data, forKey key: String) throws {
        // Delete existing item first (if any)
        try? delete(forKey: key)

        // Create query dictionary
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        // Add to Keychain
        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status: status)
        }

        if SupabaseConfig.enableDebugLogging {
            print("✅ Keychain: Saved data for key '\(key)'")
        }
    }

    /// Retrieve data from Keychain
    /// - Parameter key: Unique identifier for the data
    /// - Returns: Stored data, or nil if not found
    /// - Throws: KeychainError if operation fails (except for item not found)
    func load(forKey key: String) throws -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        if status == errSecItemNotFound {
            if SupabaseConfig.enableDebugLogging {
                print("ℹ️ Keychain: No data found for key '\(key)'")
            }
            return nil
        }

        guard status == errSecSuccess else {
            throw KeychainError.loadFailed(status: status)
        }

        guard let data = result as? Data else {
            throw KeychainError.invalidData
        }

        if SupabaseConfig.enableDebugLogging {
            print("✅ Keychain: Loaded data for key '\(key)'")
        }

        return data
    }

    /// Delete data from Keychain
    /// - Parameter key: Unique identifier for the data
    /// - Throws: KeychainError if operation fails (except for item not found)
    func delete(forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key
        ]

        let status = SecItemDelete(query as CFDictionary)

        // Treat "item not found" as success
        if status == errSecItemNotFound {
            if SupabaseConfig.enableDebugLogging {
                print("ℹ️ Keychain: No item to delete for key '\(key)'")
            }
            return
        }

        guard status == errSecSuccess else {
            throw KeychainError.deleteFailed(status: status)
        }

        if SupabaseConfig.enableDebugLogging {
            print("✅ Keychain: Deleted data for key '\(key)'")
        }
    }

    /// Update existing data in Keychain
    /// - Parameters:
    ///   - data: New data to store
    ///   - key: Unique identifier for the data
    /// - Throws: KeychainError if operation fails
    func update(_ data: Data, forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key
        ]

        let attributes: [String: Any] = [
            kSecValueData as String: data
        ]

        let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)

        if status == errSecItemNotFound {
            // Item doesn't exist, create it
            try save(data, forKey: key)
            return
        }

        guard status == errSecSuccess else {
            throw KeychainError.updateFailed(status: status)
        }

        if SupabaseConfig.enableDebugLogging {
            print("✅ Keychain: Updated data for key '\(key)'")
        }
    }

    /// Clear all data stored by this app
    /// - Throws: KeychainError if operation fails
    func clearAll() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName
        ]

        let status = SecItemDelete(query as CFDictionary)

        // Treat "item not found" as success (nothing to delete)
        if status == errSecItemNotFound {
            if SupabaseConfig.enableDebugLogging {
                print("ℹ️ Keychain: No items to clear")
            }
            return
        }

        guard status == errSecSuccess else {
            throw KeychainError.clearFailed(status: status)
        }

        if SupabaseConfig.enableDebugLogging {
            print("✅ Keychain: Cleared all data")
        }
    }

    // MARK: - Convenience Methods for Codable Types

    /// Save Codable object to Keychain
    /// - Parameters:
    ///   - object: Object conforming to Codable
    ///   - key: Unique identifier
    /// - Throws: Encoding or Keychain error
    func save<T: Codable>(_ object: T, forKey key: String) throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        let data = try encoder.encode(object)
        try save(data, forKey: key)
    }

    /// Load Codable object from Keychain
    /// - Parameters:
    ///   - type: Type to decode
    ///   - key: Unique identifier
    /// - Returns: Decoded object, or nil if not found
    /// - Throws: Decoding or Keychain error
    func load<T: Codable>(_ type: T.Type, forKey key: String) throws -> T? {
        guard let data = try load(forKey: key) else {
            return nil
        }
        let decoder = JSONDecoder()
        return try decoder.decode(type, from: data)
    }

    /// Update Codable object in Keychain
    /// - Parameters:
    ///   - object: Object conforming to Codable
    ///   - key: Unique identifier
    /// - Throws: Encoding or Keychain error
    func update<T: Codable>(_ object: T, forKey key: String) throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        let data = try encoder.encode(object)
        try update(data, forKey: key)
    }
}

// MARK: - Keychain Error Types

enum KeychainError: Error, LocalizedError {
    case saveFailed(status: OSStatus)
    case loadFailed(status: OSStatus)
    case deleteFailed(status: OSStatus)
    case updateFailed(status: OSStatus)
    case clearFailed(status: OSStatus)
    case invalidData

    var errorDescription: String? {
        switch self {
        case .saveFailed(let status):
            return "Failed to save to Keychain (status: \(status))"
        case .loadFailed(let status):
            return "Failed to load from Keychain (status: \(status))"
        case .deleteFailed(let status):
            return "Failed to delete from Keychain (status: \(status))"
        case .updateFailed(let status):
            return "Failed to update Keychain (status: \(status))"
        case .clearFailed(let status):
            return "Failed to clear Keychain (status: \(status))"
        case .invalidData:
            return "Invalid data format in Keychain"
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .saveFailed, .updateFailed:
            return "Ensure device is unlocked and storage is available"
        case .loadFailed:
            return "Item may not exist or device may be locked"
        case .deleteFailed:
            return "Item may not exist"
        case .clearFailed:
            return "Unable to clear Keychain data"
        case .invalidData:
            return "Data may be corrupted, try deleting and re-creating"
        }
    }
}

// MARK: - Migration Helper

extension KeychainService {
    /// Migrate data from UserDefaults to Keychain
    /// - Parameter key: UserDefaults key to migrate
    /// - Returns: True if migration successful or not needed, false if failed
    func migrateFromUserDefaults(key: String) -> Bool {
        // Check if already migrated
        if (try? load(forKey: key)) != nil {
            if SupabaseConfig.enableDebugLogging {
                print("ℹ️ Keychain: Key '\(key)' already migrated")
            }
            return true
        }

        // Check UserDefaults
        guard let data = UserDefaults.standard.data(forKey: key) else {
            if SupabaseConfig.enableDebugLogging {
                print("ℹ️ Keychain: No UserDefaults data to migrate for key '\(key)'")
            }
            return true // Nothing to migrate
        }

        // Migrate to Keychain
        do {
            try save(data, forKey: key)

            // Remove from UserDefaults after successful migration
            UserDefaults.standard.removeObject(forKey: key)

            if SupabaseConfig.enableDebugLogging {
                print("✅ Keychain: Successfully migrated '\(key)' from UserDefaults")
            }
            return true
        } catch {
            if SupabaseConfig.enableDebugLogging {
                print("❌ Keychain: Failed to migrate '\(key)': \(error.localizedDescription)")
            }
            return false
        }
    }
}
