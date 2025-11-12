package com.nor.wallet.services

import com.nor.wallet.BuildConfig

/**
 * Supabase configuration manager
 * Handles environment-specific configuration (development, staging, production)
 * Mirrors iOS SupabaseConfig.swift
 */
object SupabaseConfig {
    // Environment detection
    val environment: Environment
        get() = if (BuildConfig.DEBUG) {
            Environment.DEVELOPMENT
        } else {
            Environment.PRODUCTION
        }

    // Supabase URL
    val supabaseURL: String
        get() = when (environment) {
            Environment.DEVELOPMENT -> "https://acyilidfiyfeouzzfkzo.supabase.co"
            Environment.PRODUCTION -> "https://acyilidfiyfeouzzfkzo.supabase.co"
        }

    // Supabase Anon Key
    val supabaseKey: String
        get() = when (environment) {
            Environment.DEVELOPMENT -> "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg"
            Environment.PRODUCTION -> "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg"
        }

    // Feature flags
    val enableTestView: Boolean
        get() = BuildConfig.DEBUG

    val enableDebugLogging: Boolean
        get() = BuildConfig.DEBUG

    enum class Environment {
        DEVELOPMENT,
        PRODUCTION
    }
}

