import Foundation

/// Supabase configuration manager
/// Handles environment-specific configuration (development, staging, production)
struct SupabaseConfig {
    // MARK: - Environment Detection
    
    static var environment: Environment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }
    
    // MARK: - Configuration
    
    static var supabaseURL: URL {
        switch environment {
        case .development:
            // Development/Staging
            return URL(string: "https://acyilidfiyfeouzzfkzo.supabase.co")!
        case .production:
            // Production - Using deployed Supabase project
            return URL(string: "https://acyilidfiyfeouzzfkzo.supabase.co")!
        }
    }
    
    static var supabaseKey: String {
        switch environment {
        case .development:
            // Development/Staging anon key
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg"
        case .production:
            // Production anon key - Using deployed Supabase project
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg"
        }
    }
    
    // MARK: - Feature Flags
    
    static var enableTestView: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }
    
    static var enableDebugLogging: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }
    
    // MARK: - Environment Enum
    
    enum Environment {
        case development
        case production
    }
}

