package com.noor.wallet.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.noor.core.NoorCore
import com.noor.wallet.services.SupabaseService
import com.noor.wallet.services.SupabaseConfig
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import android.util.Log

/**
 * Wallet ViewModel - manages wallet state and Supabase sync
 * Mirrors iOS WalletViewModel.swift functionality
 */
class WalletViewModel : ViewModel() {
    private val supabaseService = SupabaseService.getInstance()

    private val _currentWallet = MutableStateFlow<NoorCore.WalletInfo?>(null)
    val currentWallet: StateFlow<NoorCore.WalletInfo?> = _currentWallet.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // MARK: - Wallet Operations

    fun createWallet() {
        _isLoading.value = true
        _error.value = null

        viewModelScope.launch {
            try {
                val wallet = NoorCore.createWallet()
                _currentWallet.value = wallet

                // Auto-sync to Supabase
                syncWalletToSupabase(wallet)

            } catch (e: Exception) {
                if (SupabaseConfig.enableDebugLogging) {
                    Log.e(TAG, "Failed to create wallet: ${e.message}")
                }
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun importWallet(mnemonic: String) {
        _isLoading.value = true
        _error.value = null

        viewModelScope.launch {
            try {
                val wallet = NoorCore.importWallet(mnemonic)
                _currentWallet.value = wallet

                // Auto-sync to Supabase
                syncWalletToSupabase(wallet)

            } catch (e: Exception) {
                if (SupabaseConfig.enableDebugLogging) {
                    Log.e(TAG, "Failed to import wallet: ${e.message}")
                }
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun importWallet(privateKey: String) {
        _isLoading.value = true
        _error.value = null

        viewModelScope.launch {
            try {
                val wallet = NoorCore.importWallet(privateKey)
                _currentWallet.value = wallet

                // Auto-sync to Supabase
                syncWalletToSupabase(wallet)

            } catch (e: Exception) {
                if (SupabaseConfig.enableDebugLogging) {
                    Log.e(TAG, "Failed to import wallet: ${e.message}")
                }
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    // MARK: - Supabase Sync

    private suspend fun syncWalletToSupabase(wallet: NoorCore.WalletInfo) {
        val firstAccount = wallet.accounts.firstOrNull() ?: return

        // Check if authenticated
        if (!supabaseService.isAuthenticated.value) {
            if (SupabaseConfig.enableDebugLogging) {
                Log.w(TAG, "Not authenticated - skipping Supabase sync")
            }
            return
        }

        try {
            // Register device
            val deviceName = android.os.Build.MODEL
            supabaseService.registerDevice(
                platform = "android",
                label = deviceName,
                pushToken = null // TODO: Add FCM token when notifications configured
            )

            if (SupabaseConfig.enableDebugLogging) {
                Log.d(TAG, "Device registered with Supabase")
            }

            // Sync account
            supabaseService.createAccount(
                chain = "xaheen", // Your chain name
                address = firstAccount.address,
                type = "EOA",
                isDefault = true
            )

            if (SupabaseConfig.enableDebugLogging) {
                Log.d(TAG, "Account synced to Supabase")
            }

        } catch (e: Exception) {
            if (SupabaseConfig.enableDebugLogging) {
                Log.w(TAG, "Supabase sync failed: ${e.message}")
            }
            // Don't show error to user - sync is optional
        }
    }

    companion object {
        private const val TAG = "WalletViewModel"
    }
}

