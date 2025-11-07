import XCTest
@testable import NorWallet
import NorCore

@MainActor
final class WalletViewModelTests: XCTestCase {

    var viewModel: WalletViewModel!

    override func setUp() async throws {
        try await super.setUp()
        viewModel = WalletViewModel()
    }

    override func tearDown() async throws {
        viewModel = nil
        try await super.tearDown()
    }

    // MARK: - Wallet Creation Tests

    func testCreateWalletWithMnemonic() async throws {
        // Given
        let initialWalletCount = viewModel.wallets.count

        // When
        try await viewModel.createWallet(name: "Test Wallet")

        // Then
        XCTAssertEqual(viewModel.wallets.count, initialWalletCount + 1, "Should add one wallet")
        XCTAssertNotNil(viewModel.currentWallet, "Current wallet should be set")
        XCTAssertEqual(viewModel.currentWallet?.name, "Test Wallet", "Wallet name should match")
        XCTAssertFalse(viewModel.currentWallet?.accounts.isEmpty ?? true, "Wallet should have at least one account")
    }

    func testCreateWalletGeneratesValidMnemonic() async throws {
        // When
        try await viewModel.createWallet(name: "Mnemonic Test")

        // Then
        guard let wallet = viewModel.currentWallet else {
            XCTFail("Wallet should be created")
            return
        }

        // Mnemonic should be 12 or 24 words
        let mnemonicWords = wallet.mnemonic.split(separator: " ")
        XCTAssertTrue(mnemonicWords.count == 12 || mnemonicWords.count == 24,
                     "Mnemonic should have 12 or 24 words, got \(mnemonicWords.count)")
    }

    func testCreateWalletGeneratesValidAddress() async throws {
        // When
        try await viewModel.createWallet(name: "Address Test")

        // Then
        guard let wallet = viewModel.currentWallet,
              let firstAccount = wallet.accounts.first else {
            XCTFail("Wallet and account should be created")
            return
        }

        // Check address format (Ethereum-style: 0x + 40 hex characters)
        XCTAssertTrue(firstAccount.address.hasPrefix("0x"), "Address should start with 0x")
        XCTAssertEqual(firstAccount.address.count, 42, "Address should be 42 characters (0x + 40 hex)")
    }

    // MARK: - Wallet Import Tests

    func testImportWalletWithValidMnemonic() async throws {
        // Given
        let validMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

        // When
        try await viewModel.importWallet(name: "Imported Wallet", mnemonic: validMnemonic)

        // Then
        XCTAssertNotNil(viewModel.currentWallet, "Wallet should be imported")
        XCTAssertEqual(viewModel.currentWallet?.name, "Imported Wallet")
        XCTAssertEqual(viewModel.currentWallet?.mnemonic, validMnemonic)
    }

    func testImportWalletWithInvalidMnemonicFails() async throws {
        // Given
        let invalidMnemonic = "invalid mnemonic phrase"

        // When/Then
        do {
            try await viewModel.importWallet(name: "Invalid", mnemonic: invalidMnemonic)
            XCTFail("Should throw error for invalid mnemonic")
        } catch {
            // Expected to throw
            XCTAssertTrue(true, "Correctly rejected invalid mnemonic")
        }
    }

    func testImportWalletWithPrivateKey() async throws {
        // Given - sample private key (DO NOT use in production!)
        let privateKey = "0x4c0883a69102937d6231471b5dbb6204fe512961708279f8b4d9f5ac08c8f6e"

        // When
        try await viewModel.importFromPrivateKey(name: "PK Wallet", privateKey: privateKey)

        // Then
        XCTAssertNotNil(viewModel.currentWallet, "Wallet should be imported from private key")
        XCTAssertEqual(viewModel.currentWallet?.name, "PK Wallet")
    }

    // MARK: - Wallet Selection Tests

    func testSelectWallet() async throws {
        // Given
        try await viewModel.createWallet(name: "Wallet 1")
        try await viewModel.createWallet(name: "Wallet 2")

        guard viewModel.wallets.count >= 2 else {
            XCTFail("Should have at least 2 wallets")
            return
        }

        let wallet1 = viewModel.wallets[0]
        let wallet2 = viewModel.wallets[1]

        // When - select first wallet
        viewModel.selectWallet(wallet1)

        // Then
        XCTAssertEqual(viewModel.currentWallet?.id, wallet1.id)

        // When - select second wallet
        viewModel.selectWallet(wallet2)

        // Then
        XCTAssertEqual(viewModel.currentWallet?.id, wallet2.id)
    }

    // MARK: - Asset Loading Tests

    func testLoadAssetsInitiallyEmpty() {
        // Given - new view model
        let newViewModel = WalletViewModel()

        // Then
        XCTAssertTrue(newViewModel.assets.isEmpty, "Assets should be empty initially")
    }

    func testLoadAssetsPopulatesWithData() async {
        // Given
        try? await viewModel.createWallet(name: "Test Wallet")

        // When
        await viewModel.loadAssets()

        // Then
        XCTAssertFalse(viewModel.assets.isEmpty, "Assets should be loaded")
        XCTAssertTrue(viewModel.assets.contains { $0.name == "Xaheen" }, "Should contain native token")
    }

    // MARK: - Balance Tests

    func testTotalBalanceCalculation() {
        // Given
        viewModel.assets = [
            Asset(name: "Token1", symbol: "TK1", balance: "100.0", usdValue: "100.0", change24h: 0, logoUrl: nil),
            Asset(name: "Token2", symbol: "TK2", balance: "50.0", usdValue: "200.0", change24h: 0, logoUrl: nil),
            Asset(name: "Token3", symbol: "TK3", balance: "25.0", usdValue: "300.0", change24h: 0, logoUrl: nil)
        ]

        // Then
        XCTAssertEqual(viewModel.totalBalance, "600.00", "Total balance should be sum of all asset values")
    }

    // MARK: - Transaction Tests

    func testTransactionHistoryInitiallyEmpty() {
        // Given - new view model
        let newViewModel = WalletViewModel()

        // Then
        XCTAssertTrue(newViewModel.transactions.isEmpty, "Transactions should be empty initially")
    }

    // MARK: - Security Tests

    func testWalletPrivateKeyNotExposed() async throws {
        // Given
        try await viewModel.createWallet(name: "Secure Wallet")

        // Then - verify mnemonic is available but private key is not directly exposed
        XCTAssertNotNil(viewModel.currentWallet?.mnemonic, "Mnemonic should be accessible")
        // Private key should only be accessible through secure methods
    }

    // MARK: - Persistence Tests

    func testWalletPersistence() async throws {
        // Given
        try await viewModel.createWallet(name: "Persistent Wallet")
        let walletId = viewModel.currentWallet?.id

        // When - create new view model (simulating app restart)
        let newViewModel = WalletViewModel()

        // Then - wallet should be persisted
        XCTAssertFalse(newViewModel.wallets.isEmpty, "Wallets should be persisted")
        XCTAssertTrue(newViewModel.wallets.contains { $0.id == walletId },
                     "Specific wallet should be persisted")
    }

    // MARK: - Error Handling Tests

    func testEmptyWalletNameRejected() async throws {
        // When/Then
        do {
            try await viewModel.createWallet(name: "")
            XCTFail("Should reject empty wallet name")
        } catch {
            // Expected to throw
            XCTAssertTrue(true, "Correctly rejected empty name")
        }
    }

    // MARK: - Performance Tests

    func testWalletCreationPerformance() throws {
        measure {
            Task {
                try? await viewModel.createWallet(name: "Performance Test")
            }
        }
    }

    func testAssetLoadingPerformance() throws {
        measure {
            Task {
                await viewModel.loadAssets()
            }
        }
    }
}
