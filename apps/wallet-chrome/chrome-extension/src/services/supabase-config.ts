/**
 * Supabase configuration manager
 * Handles environment-specific configuration (development, staging, production)
 * Mirrors iOS SupabaseConfig.swift
 */

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export class SupabaseConfig {
  static get environment(): Environment {
    // In Chrome extension, check manifest or environment variable
    return process.env.NODE_ENV === 'production' 
      ? Environment.PRODUCTION 
      : Environment.DEVELOPMENT;
  }

  static get supabaseURL(): string {
    switch (this.environment) {
      case Environment.DEVELOPMENT:
        return 'https://acyilidfiyfeouzzfkzo.supabase.co';
      case Environment.PRODUCTION:
        return 'https://acyilidfiyfeouzzfkzo.supabase.co';
    }
  }

  static get supabaseKey(): string {
    switch (this.environment) {
      case Environment.DEVELOPMENT:
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg';
      case Environment.PRODUCTION:
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg';
    }
  }

  static get enableTestView(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  static get enableDebugLogging(): boolean {
    return process.env.NODE_ENV !== 'production';
  }
}

