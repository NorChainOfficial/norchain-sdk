/**
 * API Proxy Configuration
 * Routes frontend API requests to NorSDK backend
 */

// Connect to Unified API
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Proxy fetch requests to backend API
 */
export async function proxyToBackend(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${BACKEND_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  return response;
}

/**
 * Check if backend API is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_API_URL.replace('/api/v1', '')}/health`, {
      method: 'GET',
      cache: 'no-store',
    });

    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

export { BACKEND_API_URL };
