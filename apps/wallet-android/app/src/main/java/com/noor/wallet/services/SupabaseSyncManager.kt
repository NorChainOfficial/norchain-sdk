package com.noor.wallet.services

import android.util.Log
import com.noor.core.NoorCore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * SupabaseSyncManager - manages automatic synchronization
 * Mirrors iOS SupabaseSyncManager.swift functionality
 */
class SupabaseSyncManager private constructor() {
    companion object {
        @Volatile
        private var INSTANCE: SupabaseSyncManager? = null

        fun getInstance(): SupabaseSyncManager {
            return INSTANCE ?: synchronized(this) {
                val instance = SupabaseSyncManager()
                INSTANCE = instance
                instance
            }
        }
    }

    private val supabaseService = SupabaseService.getInstance()
    private val scope = CoroutineScope(Dispatchers.Main)

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    private val _lastSyncTime = MutableStateFlow<Long?>(null)
    val lastSyncTime: StateFlow<Long?> = _lastSyncTime.asStateFlow()

    private val _syncError = MutableStateFlow<String?>(null)
    val syncError: StateFlow<String?> = _syncError.asStateFlow()

    init {
        // Check authentication on init
        scope.launch {
            supabaseService.checkSession()
        }
    }

    suspend fun checkAuthentication() {
        supabaseService.checkSession()
    }

    suspend fun syncWallet(wallet: NoorCore.WalletInfo) {
        if (!supabaseService.isAuthenticated.value) {
            if (SupabaseConfig.enableDebugLogging) {
                Log.w(TAG, "Not authenticated - skipping sync")
            }
            return
        }

        val firstAccount = wallet.accounts.firstOrNull() ?: run {
            if (SupabaseConfig.enableDebugLogging) {
                Log.w(TAG, "No accounts in wallet")
            }
            return
        }

        _isSyncing.value = true
        _syncError.value = null

        try {
            // Register device
            val deviceName = android.os.Build.MODEL
            val device = supabaseService.registerDevice(
                platform = "android",
                label = deviceName,
                pushToken = null // TODO: Add FCM token
            )

            if (SupabaseConfig.enableDebugLogging) {
                Log.d(TAG, "Device registered: ${device.id}")
            }

            // Sync account
            val account = supabaseService.createAccount(
                chain = "xaheen",
                address = firstAccount.address,
                type = "EOA",
                isDefault = true
            )

            if (SupabaseConfig.enableDebugLogging) {
                Log.d(TAG, "Account synced: ${account.id}")
            }

            _lastSyncTime.value = System.currentTimeMillis()
            _isSyncing.value = false

        } catch (e: Exception) {
            _syncError.value = e.message
            if (SupabaseConfig.enableDebugLogging) {
                Log.e(TAG, "Sync failed: ${e.message}")
            }
            _isSyncing.value = false
        }
    }

    fun startBackgroundSync(wallet: NoorCore.WalletInfo) {
        // TODO: Implement periodic sync
    }

    fun stopBackgroundSync() {
        // TODO: Stop periodic sync
    }

    companion object {
        private const val TAG = "SupabaseSyncManager"
    }
}

