/**
 * Environment Variable Validation
 * Ensures all required environment variables are set
 */

export interface EnvConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): EnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (error) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
  }

  return {
    supabaseUrl,
    supabaseKey,
  };
}

/**
 * Get environment configuration
 */
export function getEnvConfig(): EnvConfig {
  if (typeof window === 'undefined') {
    // Server-side
    return validateEnvironment();
  }

  // Client-side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return {
    supabaseUrl,
    supabaseKey,
  };
}

