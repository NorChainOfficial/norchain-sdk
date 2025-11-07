/**
 * API Configuration
 * NEX Exchange uses unified API as backend
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
  "http://localhost:4000";

export const API_CONFIG = {
  baseUrl: API_URL,
  endpoints: {
    // Swap & Trading
    swap: {
      quote: `${API_URL}/api/swap/quote`,
      execute: `${API_URL}/api/swap/execute`,
    },
    // Orders
    orders: {
      limit: `${API_URL}/api/orders/limit`,
      stopLoss: `${API_URL}/api/orders/stop-loss`,
      dca: `${API_URL}/api/dca/schedule`,
    },
    // Prices
    prices: `${API_URL}/api/prices`,
    // Portfolio
    portfolio: `${API_URL}/api/portfolio`,
    // Account
    account: {
      balance: `${API_URL}/api/account/balance`,
      transactions: `${API_URL}/api/account/transactions`,
    },
    // Health
    health: `${API_URL}/api/health`,
  },
};

/**
 * Make API request with authentication
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `API request failed: ${response.status}`);
  }

  return response.json();
}

