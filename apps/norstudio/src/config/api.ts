/**
 * API Configuration for NorStudio
 *
 * Provides centralized API configuration, endpoint definitions,
 * and HTTP client utilities for communicating with the backend.
 */

/**
 * API Configuration object
 */
export const API_CONFIG = {
  /**
   * Base API URL - configured via environment variable
   * Falls back to localhost:4000 for development
   */
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',

  /**
   * API version prefix
   */
  version: 'v1',

  /**
   * Request timeout in milliseconds
   */
  timeout: 30000, // 30 seconds

  /**
   * Retry configuration
   */
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryOn: [408, 429, 500, 502, 503, 504], // HTTP status codes to retry
  },

  /**
   * API Endpoints
   */
  endpoints: {
    ai: {
      chat: '/api/ai/chat',
      generateContract: '/api/ai/generate-contract',
      explainCode: '/api/ai/explain-code',
      auditContract: '/api/ai/audit-contract',
      suggestTests: '/api/ai/suggest-tests',
      optimizeGas: '/api/ai/optimize-gas',
    },
    compiler: {
      compile: '/api/compiler/compile',
      versions: '/api/compiler/versions',
    },
    contracts: {
      verify: '/api/contracts/verify',
      interact: '/api/contracts/interact',
    },
  },
} as const

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Request configuration interface
 */
export interface RequestConfig {
  readonly headers?: Record<string, string>
  readonly timeout?: number
  readonly retry?: boolean
  readonly signal?: AbortSignal
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  readonly success: boolean
  readonly data: T
  readonly error?: {
    readonly message: string
    readonly code?: string
    readonly details?: any
  }
  readonly timestamp: string
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Make HTTP request with retry logic
 */
async function makeRequest<T>(
  url: string,
  options: RequestInit,
  config: RequestConfig = {}
): Promise<T> {
  const { retry = true, timeout = API_CONFIG.timeout } = config
  const maxRetries = retry ? API_CONFIG.retry.maxRetries : 0

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // Make the request
      const response = await fetch(url, {
        ...options,
        signal: config.signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...config.headers,
        },
      })

      clearTimeout(timeoutId)

      // Handle non-OK responses
      if (!response.ok) {
        // Check if we should retry this status code
        if (
          retry &&
          attempt < maxRetries &&
          API_CONFIG.retry.retryOn.includes(response.status)
        ) {
          await sleep(API_CONFIG.retry.retryDelay * (attempt + 1))
          continue
        }

        // Parse error response
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: response.statusText }
        }

        throw new APIError(
          errorData.message || 'Request failed',
          response.status,
          errorData.code,
          errorData.details
        )
      }

      // Parse successful response
      const data = await response.json()
      return data
    } catch (error) {
      lastError = error as Error

      // Don't retry on abort or network errors (unless explicitly configured)
      if (
        error instanceof Error &&
        (error.name === 'AbortError' || !retry || attempt >= maxRetries)
      ) {
        break
      }

      // Wait before retrying
      await sleep(API_CONFIG.retry.retryDelay * (attempt + 1))
    }
  }

  // All retries exhausted
  throw lastError || new APIError('Request failed after retries')
}

/**
 * Perform GET request
 */
export async function apiGet<T>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`
  return makeRequest<T>(url, { method: 'GET' }, config)
}

/**
 * Perform POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data: any,
  config?: RequestConfig
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`
  return makeRequest<T>(
    url,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    config
  )
}

/**
 * Perform PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  data: any,
  config?: RequestConfig
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`
  return makeRequest<T>(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    config
  )
}

/**
 * Perform DELETE request
 */
export async function apiDelete<T>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`
  return makeRequest<T>(url, { method: 'DELETE' }, config)
}

/**
 * Perform PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  data: any,
  config?: RequestConfig
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`
  return makeRequest<T>(
    url,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    config
  )
}

/**
 * Check if API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get API version information
 */
export async function getAPIVersion(): Promise<{
  version: string
  environment: string
}> {
  try {
    return await apiGet('/version')
  } catch {
    return { version: 'unknown', environment: 'development' }
  }
}
