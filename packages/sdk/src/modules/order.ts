import { AxiosInstance } from 'axios';

export type OrderType = 'limit' | 'stop-loss' | 'dca';
export type OrderStatus = 'pending' | 'active' | 'filled' | 'cancelled' | 'expired';
export type OrderSide = 'buy' | 'sell';

export interface CreateLimitOrderDto {
  readonly tokenIn: string;
  readonly tokenOut: string;
  readonly amountIn: string;
  readonly limitPrice: string;
  readonly side: OrderSide;
  readonly expiresAt?: string;
}

export interface CreateStopLossOrderDto {
  readonly tokenIn: string;
  readonly tokenOut: string;
  readonly amountIn: string;
  readonly stopPrice: string;
  readonly side: OrderSide;
}

export interface CreateDCAOrderDto {
  readonly tokenIn: string;
  readonly tokenOut: string;
  readonly totalAmount: string;
  readonly frequency: 'daily' | 'weekly' | 'monthly';
  readonly numberOfOrders: number;
}

export interface Order {
  readonly id: string;
  readonly type: OrderType;
  readonly status: OrderStatus;
  readonly tokenIn: string;
  readonly tokenOut: string;
  readonly amountIn: string;
  readonly price?: string;
  readonly filledAmount?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OrdersListResponse {
  readonly orders: readonly Order[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

/**
 * Order module for advanced trading orders
 */
export class OrderModule {
  constructor(private readonly axios: AxiosInstance) {}

  /**
   * Create a limit order
   */
  async createLimitOrder(dto: CreateLimitOrderDto, idempotencyKey?: string): Promise<Order> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post<Order>('/orders/limit', dto, { headers });
    return response.data;
  }

  /**
   * Create a stop-loss order
   */
  async createStopLossOrder(dto: CreateStopLossOrderDto, idempotencyKey?: string): Promise<Order> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post<Order>('/orders/stop-loss', dto, { headers });
    return response.data;
  }

  /**
   * Create a DCA (Dollar Cost Averaging) order
   */
  async createDCAOrder(dto: CreateDCAOrderDto, idempotencyKey?: string): Promise<Order> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post<Order>('/orders/dca', dto, { headers });
    return response.data;
  }

  /**
   * Get order by ID
   */
  async get(orderId: string): Promise<Order> {
    const response = await this.axios.get<Order>(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * List all orders with filters
   */
  async list(params?: {
    readonly status?: OrderStatus;
    readonly type?: OrderType;
    readonly page?: number;
    readonly limit?: number;
  }): Promise<OrdersListResponse> {
    const response = await this.axios.get<OrdersListResponse>('/orders', { params });
    return response.data;
  }

  /**
   * Cancel an order
   */
  async cancel(orderId: string): Promise<Order> {
    const response = await this.axios.post<Order>(`/orders/${orderId}/cancel`);
    return response.data;
  }

  /**
   * Get order history for a user
   */
  async getHistory(page: number = 1, limit: number = 20): Promise<OrdersListResponse> {
    const response = await this.axios.get<OrdersListResponse>('/orders/history', {
      params: { page, limit },
    });
    return response.data;
  }
}
