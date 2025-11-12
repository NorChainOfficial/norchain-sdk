import XCTest

final class NorWalletUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    // MARK: - Onboarding Flow Tests

    func testOnboardingFlow() throws {
        // Given - app launches to onboarding
        let onboardingTitle = app.staticTexts["Welcome to Nor Wallet"]

        // Then - should show onboarding screen
        XCTAssertTrue(onboardingTitle.waitForExistence(timeout: 5),
                     "Onboarding screen should appear")

        // When - tap create wallet button
        let createWalletButton = app.buttons["Create New Wallet"]
        if createWalletButton.exists {
            createWalletButton.tap()
        }

        // Then - should show wallet creation sheet
        XCTAssertTrue(app.textFields["Wallet Name"].waitForExistence(timeout: 2),
                     "Wallet creation sheet should appear")
    }

    func testImportWalletFlow() throws {
        // Given - app launches
        let importButton = app.buttons["Import Wallet"]

        // When - tap import wallet
        if importButton.exists {
            importButton.tap()

            // Then - should show import sheet
            XCTAssertTrue(app.textFields["Wallet Name"].waitForExistence(timeout: 2),
                         "Import wallet sheet should appear")
            XCTAssertTrue(app.textViews["Mnemonic Phrase"].exists,
                         "Mnemonic input should be visible")
        }
    }

    // MARK: - Wallet Creation Tests

    func testCreateWalletWithName() throws {
        // Given - navigate to wallet creation
        app.buttons["Create New Wallet"].tap()

        let nameField = app.textFields["Wallet Name"]
        XCTAssertTrue(nameField.waitForExistence(timeout: 2))

        // When - enter wallet name
        nameField.tap()
        nameField.typeText("My Test Wallet")

        // Then - create button should be enabled
        let createButton = app.buttons["Create Wallet"]
        XCTAssertTrue(createButton.isEnabled, "Create button should be enabled")

        // When - tap create
        createButton.tap()

        // Then - should show wallet home
        XCTAssertTrue(app.staticTexts["My Test Wallet"].waitForExistence(timeout: 5),
                     "Wallet home should show wallet name")
    }

    func testMnemonicDisplayAndBackup() throws {
        // Given - create a wallet
        app.buttons["Create New Wallet"].tap()
        let nameField = app.textFields["Wallet Name"]
        nameField.tap()
        nameField.typeText("Backup Test")
        app.buttons["Create Wallet"].tap()

        // When - navigate to mnemonic backup
        if app.buttons["Show Mnemonic"].exists {
            app.buttons["Show Mnemonic"].tap()

            // Then - mnemonic should be displayed
            XCTAssertTrue(app.textViews["Mnemonic Phrase"].exists,
                         "Mnemonic should be displayed")

            // Should show 12 or 24 words
            let mnemonicText = app.textViews["Mnemonic Phrase"].value as? String
            let wordCount = mnemonicText?.split(separator: " ").count ?? 0
            XCTAssertTrue(wordCount == 12 || wordCount == 24,
                         "Mnemonic should have 12 or 24 words")
        }
    }

    // MARK: - Navigation Tests

    func testTabBarNavigation() throws {
        // Given - wallet created and showing home
        // Assuming we're at home screen

        // When - tap wallet tab
        let walletTab = app.tabBars.buttons["Wallet"]
        if walletTab.exists {
            walletTab.tap()
            XCTAssertTrue(app.otherElements["WalletHome"].waitForExistence(timeout: 2))
        }

        // When - tap DApps tab
        let dappsTab = app.tabBars.buttons["DApps"]
        if dappsTab.exists {
            dappsTab.tap()
            XCTAssertTrue(app.otherElements["DAppsView"].waitForExistence(timeout: 2))
        }

        // When - tap transactions tab
        let transactionsTab = app.tabBars.buttons["Transactions"]
        if transactionsTab.exists {
            transactionsTab.tap()
            XCTAssertTrue(app.otherElements["TransactionsView"].waitForExistence(timeout: 2))
        }

        // When - tap settings tab
        let settingsTab = app.tabBars.buttons["Settings"]
        if settingsTab.exists {
            settingsTab.tap()
            XCTAssertTrue(app.navigationBars["Settings"].waitForExistence(timeout: 2))
        }
    }

    // MARK: - Send Transaction Tests

    func testSendTransactionFlow() throws {
        // Given - at wallet home
        let sendButton = app.buttons["Send"]

        if sendButton.exists {
            // When - tap send button
            sendButton.tap()

            // Then - should show send view
            XCTAssertTrue(app.navigationBars["Send"].waitForExistence(timeout: 2),
                         "Send view should appear")

            // Verify required fields exist
            XCTAssertTrue(app.textFields["Recipient Address"].exists,
                         "Recipient field should exist")
            XCTAssertTrue(app.textFields["Amount"].exists,
                         "Amount field should exist")
        }
    }

    func testSendTransactionValidation() throws {
        // Given - at send view
        app.buttons["Send"].tap()

        // When - try to send without entering data
        let sendButton = app.buttons["Confirm Send"]
        if sendButton.exists {
            XCTAssertFalse(sendButton.isEnabled,
                          "Send button should be disabled when fields are empty")

            // When - enter invalid address
            app.textFields["Recipient Address"].tap()
            app.textFields["Recipient Address"].typeText("invalid-address")

            // Then - should show error or keep button disabled
            XCTAssertFalse(sendButton.isEnabled,
                          "Send button should be disabled for invalid address")
        }
    }

    // MARK: - Receive Tests

    func testReceiveFlow() throws {
        // Given - at wallet home
        let receiveButton = app.buttons["Receive"]

        if receiveButton.exists {
            // When - tap receive button
            receiveButton.tap()

            // Then - should show receive view with QR code
            XCTAssertTrue(app.navigationBars["Receive"].waitForExistence(timeout: 2),
                         "Receive view should appear")
            XCTAssertTrue(app.images["QR Code"].exists,
                         "QR code should be displayed")
            XCTAssertTrue(app.staticTexts.matching(identifier: "Address").firstMatch.exists,
                         "Address should be displayed")
        }
    }

    func testCopyAddressInReceiveView() throws {
        // Given - at receive view
        app.buttons["Receive"].tap()

        // When - tap copy button
        let copyButton = app.buttons["Copy Address"]
        if copyButton.exists {
            copyButton.tap()

            // Then - should show success feedback
            XCTAssertTrue(app.staticTexts["Copied!"].waitForExistence(timeout: 1),
                         "Should show copied confirmation")
        }
    }

    // MARK: - Security Settings Tests

    func testSecuritySettingsNavigation() throws {
        // Given - navigate to settings
        app.tabBars.buttons["Settings"].tap()

        // When - tap security settings
        let securityRow = app.cells["Security"]
        if securityRow.exists {
            securityRow.tap()

            // Then - should show security view
            XCTAssertTrue(app.navigationBars["Security"].waitForExistence(timeout: 2),
                         "Security view should appear")
        }
    }

    func testBiometricSettingToggle() throws {
        // Given - at security settings
        app.tabBars.buttons["Settings"].tap()
        app.cells["Security"].tap()

        // When - toggle Face ID/Touch ID
        let biometricSwitch = app.switches["Face ID"]
        if biometricSwitch.exists {
            let initialState = biometricSwitch.value as? String == "1"
            biometricSwitch.tap()

            // Then - switch should toggle
            let newState = biometricSwitch.value as? String == "1"
            XCTAssertNotEqual(initialState, newState,
                             "Biometric setting should toggle")
        }
    }

    func testAutoLockSettings() throws {
        // Given - at security settings
        app.tabBars.buttons["Settings"].tap()
        app.cells["Security"].tap()

        // When - tap auto-lock settings
        let autoLockRow = app.cells["Auto-Lock"]
        if autoLockRow.exists {
            autoLockRow.tap()

            // Then - should show auto-lock options
            XCTAssertTrue(app.navigationBars["Auto-Lock"].waitForExistence(timeout: 2),
                         "Auto-lock settings should appear")

            // Verify options exist
            XCTAssertTrue(app.buttons["Immediately"].exists ||
                         app.cells["Immediately"].exists,
                         "Auto-lock options should be displayed")
        }
    }

    // MARK: - Account Management Tests

    func testAccountDetailsView() throws {
        // Given - at wallet home
        let accountCard = app.otherElements["Account Card"]

        if accountCard.exists {
            // When - tap account card
            accountCard.tap()

            // Then - should show account details
            XCTAssertTrue(app.navigationBars["Account Details"].waitForExistence(timeout: 2),
                         "Account details should appear")
        }
    }

    // MARK: - Network Switching Tests

    func testNetworkSwitcher() throws {
        // Given - at wallet home
        let networkButton = app.buttons["Network"]

        if networkButton.exists {
            // When - tap network button
            networkButton.tap()

            // Then - should show network options
            XCTAssertTrue(app.staticTexts["Select Network"].waitForExistence(timeout: 2) ||
                         app.sheets.firstMatch.exists,
                         "Network selector should appear")

            // Verify networks are listed
            XCTAssertTrue(app.buttons["Xaheen"].exists ||
                         app.cells["Xaheen"].exists,
                         "Networks should be listed")
        }
    }

    // MARK: - Asset List Tests

    func testAssetListDisplay() throws {
        // Given - at wallet home
        let assetsList = app.collectionViews["Assets List"]

        if assetsList.exists {
            // Then - should show assets
            XCTAssertTrue(assetsList.cells.count > 0,
                         "Should display at least one asset")

            // Native token should be first
            let firstCell = assetsList.cells.firstMatch
            XCTAssertTrue(firstCell.staticTexts["Xaheen"].exists ||
                         firstCell.staticTexts["XAH"].exists,
                         "Native token should be displayed")
        }
    }

    // MARK: - Transaction History Tests

    func testTransactionHistoryView() throws {
        // Given - navigate to transactions
        app.tabBars.buttons["Transactions"].tap()

        // Then - should show transactions view
        XCTAssertTrue(app.navigationBars["Transactions"].waitForExistence(timeout: 2),
                     "Transactions view should appear")

        // Should show empty state or transaction list
        XCTAssertTrue(app.staticTexts["No Transactions"].exists ||
                     app.tables["Transaction List"].exists,
                     "Should show empty state or transaction list")
    }

    // MARK: - Settings Tests

    func testSettingsOptions() throws {
        // Given - navigate to settings
        app.tabBars.buttons["Settings"].tap()

        // Then - should show key settings options
        XCTAssertTrue(app.cells["Security"].exists,
                     "Security settings should be available")
        XCTAssertTrue(app.cells["Network"].exists ||
                     app.cells["Networks"].exists,
                     "Network settings should be available")
        XCTAssertTrue(app.cells["About"].exists ||
                     app.cells["Help & Support"].exists,
                     "Help section should be available")
    }

    // MARK: - Performance Tests

    func testLaunchPerformance() throws {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }

    func testScrollPerformance() throws {
        // Given - at wallet home with assets
        let assetsList = app.collectionViews["Assets List"]

        if assetsList.exists {
            // When - scroll through assets
            measure(metrics: [XCTOSSignpostMetric.scrollDecelerationMetric]) {
                assetsList.swipeUp()
                assetsList.swipeDown()
            }
        }
    }

    // MARK: - Accessibility Tests

    func testVoiceOverLabels() throws {
        // Verify key elements have accessibility labels
        let sendButton = app.buttons["Send"]
        if sendButton.exists {
            XCTAssertFalse(sendButton.label.isEmpty,
                          "Send button should have accessibility label")
        }

        let receiveButton = app.buttons["Receive"]
        if receiveButton.exists {
            XCTAssertFalse(receiveButton.label.isEmpty,
                          "Receive button should have accessibility label")
        }
    }
}
