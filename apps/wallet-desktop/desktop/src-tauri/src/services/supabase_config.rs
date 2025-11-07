/// Supabase configuration manager
/// Handles environment-specific configuration (development, staging, production)
/// Mirrors iOS SupabaseConfig.swift

pub struct SupabaseConfig;

impl SupabaseConfig {
    pub fn environment() -> Environment {
        #[cfg(debug_assertions)]
        return Environment::Development;
        #[cfg(not(debug_assertions))]
        return Environment::Production;
    }

    pub fn supabase_url() -> &'static str {
        match Self::environment() {
            Environment::Development => "https://acyilidfiyfeouzzfkzo.supabase.co",
            Environment::Production => "https://acyilidfiyfeouzzfkzo.supabase.co",
        }
    }

    pub fn supabase_key() -> &'static str {
        match Self::environment() {
            Environment::Development => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg",
            Environment::Production => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg",
        }
    }

    pub fn enable_test_view() -> bool {
        #[cfg(debug_assertions)]
        return true;
        #[cfg(not(debug_assertions))]
        return false;
    }

    pub fn enable_debug_logging() -> bool {
        #[cfg(debug_assertions)]
        return true;
        #[cfg(not(debug_assertions))]
        return false;
    }
}

#[derive(Debug, Clone, Copy)]
pub enum Environment {
    Development,
    Production,
}

