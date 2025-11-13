const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || `${API_URL}/api/v1`

export const API_CONFIG = {
  baseUrl: API_URL,
  baseApiUrl: API_BASE_URL,
  endpoints: {
    // Contract endpoints
    contracts: {
      compile: `${API_BASE_URL}/contracts/compile`,
      deploy: `${API_BASE_URL}/contracts/deploy`,
      verify: `${API_BASE_URL}/contracts/verify`,
      getAbi: `${API_BASE_URL}/contracts/getabi`,
      getSource: `${API_BASE_URL}/contracts/getsourcecode`,
    },
    // AI endpoints
    ai: {
      chat: `${API_BASE_URL}/ai/chat`,
      auditContract: `${API_BASE_URL}/ai/audit-contract`,
      analyzeTransaction: `${API_BASE_URL}/ai/analyze-transaction`,
      generateContract: `${API_BASE_URL}/ai/generate-contract`,
      explainCode: `${API_BASE_URL}/ai/explain-code`,
      suggestTests: `${API_BASE_URL}/ai/suggest-tests`,
    },
    // Project endpoints
    projects: {
      list: `${API_BASE_URL}/projects`,
      create: `${API_BASE_URL}/projects`,
      get: (id: string) => `${API_BASE_URL}/projects/${id}`,
      update: (id: string) => `${API_BASE_URL}/projects/${id}`,
      delete: (id: string) => `${API_BASE_URL}/projects/${id}`,
    },
    // Template endpoints
    templates: {
      list: `${API_BASE_URL}/templates`,
      get: (id: string) => `${API_BASE_URL}/templates/${id}`,
    },
    // Transaction endpoints
    transactions: {
      send: `${API_BASE_URL}/transactions/send`,
      getInfo: (hash: string) => `${API_BASE_URL}/transactions/${hash}`,
    },
    // Account endpoints
    accounts: {
      getBalance: (address: string) => `${API_BASE_URL}/accounts/${address}/balance`,
      getNonce: (address: string) => `${API_BASE_URL}/accounts/${address}/nonce`,
    },
  },
} as const

export interface ApiError {
  readonly message: string
  readonly code?: string
  readonly status?: number
}

export interface ApiResponse<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: ApiError
}

/**
 * Make an API request with proper error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }))
      throw new Error(errorData.message || `API request failed: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

/**
 * POST request helper
 */
export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request helper
 */
export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}
