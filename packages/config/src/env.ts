/**
 * Environment variable helpers and validation
 */

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Get environment variable with fallback
 */
export const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value === undefined && fallback === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? fallback ?? '';
};

/**
 * Get required environment variable (throws if missing)
 */
export const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

/**
 * Get environment variable as number
 */
export const getEnvAsNumber = (key: string, fallback?: number): number => {
  const value = process.env[key];
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return fallback;
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return num;
};

/**
 * Get environment variable as boolean
 */
export const getEnvAsBoolean = (key: string, fallback?: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return fallback;
  }
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Get current environment
 */
export const getCurrentEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || 'development';
  if (!['development', 'staging', 'production', 'test'].includes(env)) {
    return 'development';
  }
  return env as Environment;
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return getCurrentEnvironment() === 'production';
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return getCurrentEnvironment() === 'development';
};

/**
 * Check if running in test
 */
export const isTest = (): boolean => {
  return getCurrentEnvironment() === 'test';
};

/**
 * Common environment variables
 */
export const ENV_KEYS = {
  // Node
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',

  // API
  API_URL: 'NEXT_PUBLIC_API_URL',
  API_KEY: 'API_KEY',

  // Database
  DATABASE_URL: 'DATABASE_URL',

  // Redis
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',

  // Blockchain
  NORCHAIN_RPC: 'NEXT_PUBLIC_NORCHAIN_RPC',
  CHAIN_ID: 'NEXT_PUBLIC_CHAIN_ID',

  // Supabase
  SUPABASE_URL: 'SUPABASE_URL',
  SUPABASE_ANON_KEY: 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_KEY: 'SUPABASE_SERVICE_KEY',

  // JWT
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRATION: 'JWT_EXPIRATION',

  // Rate limiting
  THROTTLE_TTL: 'THROTTLE_TTL',
  THROTTLE_LIMIT: 'THROTTLE_LIMIT',
} as const;

/**
 * Validate required environment variables
 */
export const validateEnv = (requiredKeys: readonly string[]): void => {
  const missing: string[] = [];

  requiredKeys.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}`
    );
  }
};
