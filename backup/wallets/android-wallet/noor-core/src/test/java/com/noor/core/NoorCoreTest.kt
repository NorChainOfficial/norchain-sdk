package com.nor.core

import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class NorCoreTest {

    @Before
    fun setUp() {
        NorCore.initLogger(NorCore.LogLevel.INFO)
    }

    @Test
    fun testChainConfiguration() {
        val chainId = NorCore.chainId
        assertEquals("Chain ID should be 7860 for Nor Chain", 7860L, chainId)

        val rpcUrl = NorCore.chainRpcUrl
        assertEquals("RPC URL should match Nor Chain", "https://rpc.norchain.org", rpcUrl)
        assertFalse("RPC URL should not be empty", rpcUrl.isEmpty())
    }

    @Test
    fun testWalletCreation() {
        val wallet = NorCore.createWallet()

        assertNotNull("Wallet creation should succeed", wallet)
        assertFalse("Wallet ID should not be empty", wallet?.id.isNullOrEmpty())
        assertEquals("New wallet should have 1 default account", 1, wallet?.accounts?.size)

        wallet?.accounts?.firstOrNull()?.let { account ->
            assertEquals("First account should have index 0", 0, account.index)
            assertFalse("Account address should not be empty", account.address.isEmpty())
            assertTrue("EVM address should start with 0x", account.address.startsWith("0x"))
            assertEquals("EVM address should be 42 characters", 42, account.address.length)
            assertFalse("Public key should not be empty", account.publicKey.isEmpty())
            assertEquals("Default chain type should be EVM", "EVM", account.chainType)
        }
    }

    @Test
    fun testWalletFromMnemonic() {
        val testMnemonic =
                "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

        val wallet = NorCore.importWallet(testMnemonic)

        assertNotNull("Wallet import from mnemonic should succeed", wallet)
        assertFalse("Imported wallet should have ID", wallet?.id.isNullOrEmpty())
        assertTrue(
                "Imported wallet should have at least 1 account",
                (wallet?.accounts?.size ?: 0) >= 1
        )

        // Test deterministic address derivation
        wallet?.accounts?.firstOrNull()?.let { account ->
            val expectedAddress = "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
            assertEquals(
                    "Address should match expected deterministic derivation",
                    expectedAddress.lowercase(),
                    account.address.lowercase()
            )
        }
    }

    @Test
    fun testMultipleWalletCreations() {
        val wallet1 = NorCore.createWallet()
        val wallet2 = NorCore.createWallet()

        assertNotNull("First wallet should be created", wallet1)
        assertNotNull("Second wallet should be created", wallet2)
        assertNotEquals("Different wallets should have different IDs", wallet1?.id, wallet2?.id)

        val addr1 = wallet1?.accounts?.firstOrNull()?.address
        val addr2 = wallet2?.accounts?.firstOrNull()?.address
        assertNotEquals("Different wallets should have different addresses", addr1, addr2)
    }

    @Test
    fun testInvalidMnemonicHandling() {
        val invalidMnemonic = "invalid mnemonic phrase that won't work"

        val wallet = NorCore.importWallet(invalidMnemonic)

        // Should return null or empty wallet for invalid mnemonic
        if (wallet != null) {
            assertTrue(
                    "Invalid mnemonic should result in empty/invalid wallet",
                    wallet.id.isEmpty() || wallet.accounts.isEmpty()
            )
        }
    }

    @Test
    fun testLoggerInitialization() {
        // Test different log levels - should not throw exceptions
        NorCore.initLogger(NorCore.LogLevel.TRACE)
        NorCore.initLogger(NorCore.LogLevel.DEBUG)
        NorCore.initLogger(NorCore.LogLevel.INFO)
        NorCore.initLogger(NorCore.LogLevel.WARN)
        NorCore.initLogger(NorCore.LogLevel.ERROR)
    }

    @Test
    fun testMemoryManagement() {
        // Create many wallets to test memory is properly freed
        repeat(100) {
            val wallet = NorCore.createWallet()
            assertNotNull("Wallet $it should be created", wallet)
        }

        // If memory isn't freed properly, this would cause issues
        // The try-finally pattern in Kotlin should ensure cleanup
    }

    @Test
    fun testConcurrentWalletCreation() {
        val wallets = mutableListOf<NorCore.WalletInfo?>()
        val threads =
                List(10) {
                    Thread {
                        val wallet = NorCore.createWallet()
                        synchronized(wallets) { wallets.add(wallet) }
                    }
                }

        threads.forEach { it.start() }
        threads.forEach { it.join() }

        assertEquals("Should create 10 wallets", 10, wallets.size)
        wallets.forEach { wallet ->
            assertNotNull("Each wallet should be created successfully", wallet)
        }

        // Check all wallets have unique IDs
        val uniqueIds = wallets.mapNotNull { it?.id }.toSet()
        assertEquals("All wallets should have unique IDs", wallets.size, uniqueIds.size)
    }
}
