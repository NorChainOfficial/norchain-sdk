/**
 * GraphQL Context
 * Request context with DataLoaders, authentication, and rate limiting
 */

import type { NextRequest } from 'next/server';
import { ethers } from 'ethers';
import { createDataLoaders, type DataLoaderContext } from './dataloaders';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

export interface GraphQLContext {
  dataloaders: DataLoaderContext;
  provider: ethers.JsonRpcProvider;
  apiKey?: string;
  requestId: string;
  user?: {
    id: string;
    tier: 'free' | 'premium' | 'enterprise';
  };
}

/**
 * Rate limit tracking (in-memory, use Redis in production)
 */
const rateLimits = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

/**
 * Get rate limit for API key
 */
function getRateLimit(tier: string): { limit: number; window: number } {
  switch (tier) {
    case 'enterprise':
      return { limit: 10000, window: 60000 }; // 10k per minute
    case 'premium':
      return { limit: 1000, window: 60000 }; // 1k per minute
    case 'free':
    default:
      return { limit: 100, window: 60000 }; // 100 per minute
  }
}

/**
 * Check rate limit
 */
function checkRateLimit(key: string, tier: string): boolean {
  const now = Date.now();
  const { limit, window } = getRateLimit(tier);

  const current = rateLimits.get(key);

  if (!current || now > current.resetAt) {
    rateLimits.set(key, {
      count: 1,
      resetAt: now + window,
    });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Validate API key
 */
function validateApiKey(apiKey: string | null): {
  valid: boolean;
  user?: { id: string; tier: 'free' | 'premium' | 'enterprise' };
} {
  if (!apiKey) {
    return { valid: true, user: { id: 'anonymous', tier: 'free' } };
  }

  // In production, validate against database
  // For now, simple validation
  if (apiKey.startsWith('norchain_premium_')) {
    return {
      valid: true,
      user: { id: apiKey, tier: 'premium' },
    };
  }

  if (apiKey.startsWith('norchain_enterprise_')) {
    return {
      valid: true,
      user: { id: apiKey, tier: 'enterprise' },
    };
  }

  if (apiKey.startsWith('norchain_')) {
    return {
      valid: true,
      user: { id: apiKey, tier: 'free' },
    };
  }

  return { valid: false };
}

/**
 * Create GraphQL context for each request
 */
export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  // Extract API key from header
  const apiKey = req.headers.get('x-api-key');

  // Validate API key
  const auth = validateApiKey(apiKey);
  if (!auth.valid) {
    throw new Error('Invalid API key');
  }

  // Check rate limit
  const rateLimitKey = auth.user?.id || 'anonymous';
  const tier = auth.user?.tier || 'free';

  if (!checkRateLimit(rateLimitKey, tier)) {
    throw new Error('Rate limit exceeded');
  }

  // Generate request ID
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create ethers provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Create DataLoaders for this request
  const dataloaders = createDataLoaders();

  return {
    dataloaders,
    provider,
    apiKey: apiKey || undefined,
    requestId,
    user: auth.user,
  };
}

/**
 * Plugin to add request logging
 */
export const loggingPlugin = {
  async requestDidStart(requestContext: any): Promise<any> {
    const start = Date.now();

    return {
      async willSendResponse(responseContext: any): Promise<void> {
        const duration = Date.now() - start;
        const { context, request } = responseContext;

        console.log({
          requestId: context.requestId,
          operationName: request.operationName,
          duration: `${duration}ms`,
          apiKey: context.apiKey ? '***' : 'none',
          tier: context.user?.tier || 'free',
        });
      },
    };
  },
};
