package com.nor.wallet.services

import android.util.Log
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Supabase service for Android
 * Mirrors iOS SupabaseService.swift functionality
 */
class SupabaseService private constructor() {
    companion object {
        @Volatile
        private var INSTANCE: SupabaseService? = null

        fun getInstance(): SupabaseService {
            return INSTANCE ?: synchronized(this) {
                val instance = SupabaseService()
                INSTANCE = instance
                instance
            }
        }
    }

    private val supabase: SupabaseClient = createSupabaseClient(
        supabaseUrl = SupabaseConfig.supabaseURL,
        supabaseKey = SupabaseConfig.supabaseKey
    ) {
        install(io.github.jan.supabase.gotrue.Auth)
        install(io.github.jan.supabase.postgrest.Postgrest)
        install(io.github.jan.supabase.realtime.Realtime)
        install(io.github.jan.supabase.storage.Storage)
        install(io.github.jan.supabase.functions.Functions)
    }

    private val _currentSession = MutableStateFlow<Session?>(null)
    val currentSession: StateFlow<Session?> = _currentSession.asStateFlow()

    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    init {
        // Check existing session on init
        checkSession()
        observeAuthChanges()
    }

    // MARK: - Authentication

    suspend fun checkSession() {
        try {
            val session = supabase.auth.currentSessionOrNull()
            _currentSession.value = session?.let { Session(it) }
            _isAuthenticated.value = session != null
        } catch (e: Exception) {
            if (SupabaseConfig.enableDebugLogging) {
                Log.w(TAG, "Session check failed: ${e.message}")
            }
            _currentSession.value = null
            _isAuthenticated.value = false
        }
    }

    suspend fun signUp(email: String, password: String): Session {
        val response = supabase.auth.signUpWith(Email) {
            this.email = email
            this.password = password
        }
        
        val session = response.session
        if (session != null) {
            _currentSession.value = Session(session)
            _isAuthenticated.value = true
            return Session(session)
        } else {
            throw Exception("No session returned")
        }
    }

    suspend fun signIn(email: String, password: String): Session {
        val response = supabase.auth.signInWith(Email) {
            this.email = email
            this.password = password
        }
        
        val session = response.session
        if (session != null) {
            _currentSession.value = Session(session)
            _isAuthenticated.value = true
            return Session(session)
        } else {
            throw Exception("No session returned")
        }
    }

    suspend fun signOut() {
        supabase.auth.signOut()
        _currentSession.value = null
        _isAuthenticated.value = false
    }

    private fun observeAuthChanges() {
        // TODO: Implement auth state listener
        // Supabase Kotlin SDK auth state changes
    }

    // MARK: - Devices

    data class Device(
        val id: String,
        val userId: String,
        val platform: String,
        val label: String,
        val pushToken: String?
    )

    suspend fun registerDevice(
        platform: String,
        label: String,
        pushToken: String?
    ): Device {
        val userId = _currentSession.value?.userId ?: throw Exception("Not authenticated")
        
        val deviceData = mapOf(
            "user_id" to userId,
            "platform" to platform,
            "label" to label,
            "push_token" to pushToken,
            "last_seen" to System.currentTimeMillis()
        )

        val response = supabase.from("devices").insert(deviceData)
        // Parse response and return Device
        // TODO: Parse response properly
        return Device(
            id = "",
            userId = userId,
            platform = platform,
            label = label,
            pushToken = pushToken
        )
    }

    // MARK: - Accounts

    data class SupabaseAccount(
        val id: String,
        val userId: String,
        val chain: String,
        val address: String,
        val type: String,
        val isDefault: Boolean
    )

    suspend fun createAccount(
        chain: String,
        address: String,
        type: String,
        isDefault: Boolean
    ): SupabaseAccount {
        val userId = _currentSession.value?.userId ?: throw Exception("Not authenticated")
        
        val accountData = mapOf(
            "user_id" to userId,
            "chain" to chain,
            "address" to address,
            "type" to type,
            "is_default" to isDefault
        )

        val response = supabase.from("accounts").insert(accountData)
        // TODO: Parse response
        return SupabaseAccount(
            id = "",
            userId = userId,
            chain = chain,
            address = address,
            type = type,
            isDefault = isDefault
        )
    }

    suspend fun fetchAccounts(): List<SupabaseAccount> {
        val userId = _currentSession.value?.userId ?: throw Exception("Not authenticated")
        
        val response = supabase.from("accounts")
            .select {
                filter {
                    eq("user_id", userId)
                }
            }
        
        // TODO: Parse response
        return emptyList()
    }

    // MARK: - Helper Classes

    data class Session(
        val userId: String,
        val accessToken: String,
        val refreshToken: String
    ) {
        constructor(session: io.github.jan.supabase.gotrue.auth.Session) : this(
            userId = session.user.id,
            accessToken = session.accessToken,
            refreshToken = session.refreshToken ?: ""
        )
    }

    companion object {
        private const val TAG = "SupabaseService"
    }
}

