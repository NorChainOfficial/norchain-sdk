import { API_CONFIG, apiRequest } from "@/config/api";
import type { SwapQuote } from "@/types/token";

/**
 * API Client for Explorer API
 * All backend calls go through Explorer API
 */

export interface SwapQuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  chainId: number;
}

export interface LimitOrderRequest {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
  priceLimit: string;
  chainId: number;
  expiresAt?: string;
}

/**
 * Get swap quote from Explorer API
 */
export async function getSwapQuote(
  request: SwapQuoteRequest
): Promise<SwapQuote> {
  return apiRequest<SwapQuote>(API_CONFIG.endpoints.swap.quote, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Get token prices
 */
export async function getPrices(token?: string) {
  const url = token
    ? `${API_CONFIG.endpoints.prices}?token=${token}`
    : API_CONFIG.endpoints.prices;
  return apiRequest(url);
}

/**
 * Get account balance
 */
export async function getAccountBalance(address: string, chainId: number) {
  return apiRequest(
    `${API_CONFIG.endpoints.account.balance}?address=${address}&chainId=${chainId}`
  );
}

/**
 * Get portfolio data
 */
export async function getPortfolio(address: string) {
  return apiRequest(`${API_CONFIG.endpoints.portfolio}?address=${address}`);
}

/**
 * Create limit order
 */
export async function createLimitOrder(order: LimitOrderRequest) {
  return apiRequest(API_CONFIG.endpoints.orders.limit, {
    method: "POST",
    body: JSON.stringify(order),
  });
}

/**
 * Get limit orders
 */
export async function getLimitOrders(address: string) {
  return apiRequest(`${API_CONFIG.endpoints.orders.limit}?user=${address}`);
}

/**
 * Create stop-loss order
 */
export async function createStopLossOrder(order: {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  stopPrice: string;
  chainId: number;
}) {
  return apiRequest(API_CONFIG.endpoints.orders.stopLoss, {
    method: "POST",
    body: JSON.stringify(order),
  });
}

/**
 * Create DCA schedule
 */
export async function createDCASchedule(schedule: {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountPerOrder: string;
  frequency: "daily" | "weekly" | "monthly";
  chainId: number;
  startDate: string;
  endDate?: string;
  nextExecution: string;
}) {
  return apiRequest(API_CONFIG.endpoints.orders.dca, {
    method: "POST",
    body: JSON.stringify(schedule),
  });
}

