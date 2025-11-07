/**
 * AI Transaction Decoder API Route
 *
 * POST /api/ai/decode-transaction
 *
 * Provides AI-powered transaction analysis with rate limiting
 * and caching for optimal performance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTransactionDecoder } from '@/lib/ai/transaction-decoder';
import {
  TransactionAnalysisRequest,
  isAIAnalysisError,
  isTransactionAnalysisResult,
} from '@/lib/ai/types';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute (free tier)

// Simple in-memory rate limiter
interface RateLimitEntry {
  readonly count: number;
  readonly resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => rateLimitMap.delete(key));
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupRateLimits();

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    // New window
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  rateLimitMap.set(ip, { count: entry.count + 1, resetAt: entry.resetAt });
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count - 1,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): body is TransactionAnalysisRequest {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const req = body as Record<string, unknown>;

  return (
    typeof req.hash === 'string' &&
    req.hash.length > 0 &&
    typeof req.type === 'string' &&
    typeof req.sender === 'string' &&
    typeof req.gasUsed === 'number' &&
    typeof req.gasWanted === 'number' &&
    typeof req.status === 'string' &&
    typeof req.timestamp === 'string'
  );
}

/**
 * POST handler - Analyze transaction
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT',
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          code: 'INVALID_INPUT',
          message: 'Missing or invalid required fields in request body',
        },
        {
          status: 400,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    // Get decoder instance
    const decoder = getTransactionDecoder();

    // Analyze transaction
    const result = await decoder.analyzeTransaction(body as TransactionAnalysisRequest);

    // Check for errors
    if (isAIAnalysisError(result)) {
      const status = result.code === 'RATE_LIMIT' ? 429 : result.code === 'INVALID_INPUT' ? 400 : 500;
      return NextResponse.json(
        {
          success: false,
          ...result,
        },
        {
          status,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    // Return successful result
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('AI decode transaction error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'API_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * GET handler - Not allowed
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests',
    },
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    }
  );
}

/**
 * OPTIONS handler - CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
