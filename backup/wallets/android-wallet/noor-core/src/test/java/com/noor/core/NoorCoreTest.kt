package com.noor.core

import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class NoorCoreTest {

    @Before
    fun setUp() {
        NoorCore.initLogger(NoorCore.LogLevel.INFO)
    }

    @Test
    fun testChainConfiguration() {
        val chainId = NoorCore.chainId
        assertEquals("Chain ID should be 7860 for Noor Chain", 7860L, chainId)

        val rpcUrl = NoorCore.chainRpcUrl
        assertEquals("RPC URL should match Noor Chain", "https://rpc.noorchain.org", rpcUrl)
        assertFalse("RPC URL should not be empty", rpcUrl.isEmpty())
    }

    @Test
    fun testWalletCreation() {
        val wallet = NoorCore.createWallet()

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

        val wallet = NoorCore.importWallet(testMnemonic)

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
        val wallet1 = NoorCore.createWallet()
        val wallet2 = NoorCore.createWallet()

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

        val wallet = NoorCore.importWallet(invalidMnemonic)

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
        NoorCore.initLogger(NoorCore.LogLevel.TRACE)
        NoorCore.initLogger(NoorCore.LogLevel.DEBUG)
        NoorCore.initLogger(NoorCore.LogLevel.INFO)
        NoorCore.initLogger(NoorCore.LogLevel.WARN)
        NoorCore.initLogger(NoorCore.LogLevel.ERROR)
    }

    @Test
    fun testMemoryManagement() {
        // Create many wallets to test memory is properly freed
        repeat(100) {
            val wallet = NoorCore.createWallet()
            assertNotNull("Wallet $it should be created", wallet)
        }

        // If memory isn't freed properly, this would cause issues
        // The try-finally pattern in Kotlin should ensure cleanup
    }

    @Test
    fun testConcurrentWalletCreation() {
        val wallets = mutableListOf<NoorCore.WalletInfo?>()
        val threads =
                List(10) {
                    Thread {
                        val wallet = NoorCore.createWallet()
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
