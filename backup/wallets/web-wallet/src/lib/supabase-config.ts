/**
 * Supabase configuration manager
 * Handles environment-specific configuration (development, staging, production)
 * Mirrors iOS SupabaseConfig.swift functionality
 */

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export class SupabaseConfig {
  static get environment(): Environment {
    return process.env.NODE_ENV === 'production' 
      ? Environment.PRODUCTION 
      : Environment.DEVELOPMENT;
  }

  static get supabaseURL(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    return url;
  }

  static get supabaseKey(): string {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
    return key;
  }

  static get enableTestView(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  static get enableDebugLogging(): boolean {
    return process.env.NODE_ENV !== 'production';
  }
}

