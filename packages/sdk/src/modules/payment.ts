import { AxiosInstance } from 'axios';

export type InvoiceStatus = 'pending' | 'paid' | 'expired' | 'cancelled';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'incomplete';

export interface CreateInvoiceDto {
  readonly amount: string;
  readonly currency: string;
  readonly description?: string;
  readonly metadata?: Record<string, any>;
  readonly expiresAt?: string;
}

export interface Invoice {
  readonly id: string;
  readonly amount: string;
  readonly currency: string;
  readonly status: InvoiceStatus;
  readonly description?: string;
  readonly paymentAddress?: string;
  readonly createdAt: string;
  readonly expiresAt?: string;
}

export interface CreatePOSSessionDto {
  readonly amount: string;
  readonly currency: string;
  readonly merchantId: string;
  readonly metadata?: Record<string, any>;
}

export interface POSSession {
  readonly id: string;
  readonly amount: string;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly qrCode?: string;
  readonly paymentAddress: string;
  readonly createdAt: string;
}

export interface OnboardMerchantDto {
  readonly businessName: string;
  readonly businessType: string;
  readonly country: string;
  readonly email: string;
  readonly walletAddress: string;
}

export interface CreateCheckoutSessionDto {
  readonly amount: string;
  readonly currency: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
  readonly metadata?: Record<string, any>;
}

export interface CreateProductDto {
  readonly name: string;
  readonly description?: string;
  readonly metadata?: Record<string, any>;
}

export interface CreatePriceDto {
  readonly productId: string;
  readonly amount: string;
  readonly currency: string;
  readonly recurring?: {
    readonly interval: 'day' | 'week' | 'month' | 'year';
    readonly intervalCount: number;
  };
}

export interface CreateCustomerDto {
  readonly email: string;
  readonly name?: string;
  readonly walletAddress?: string;
  readonly metadata?: Record<string, any>;
}

export interface CreateSubscriptionDto {
  readonly customerId: string;
  readonly priceId: string;
  readonly trialPeriodDays?: number;
}

export interface CreateRefundDto {
  readonly paymentId: string;
  readonly amount?: string;
  readonly reason?: string;
}

export interface CreateDisputeDto {
  readonly paymentId: string;
  readonly reason: string;
  readonly evidence?: string;
}

/**
 * Payment module for payment processing operations
 */
export class PaymentModule {
  constructor(private readonly axios: AxiosInstance) {}

  /**
   * Create a payment invoice
   */
  async createInvoice(dto: CreateInvoiceDto, idempotencyKey?: string): Promise<Invoice> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post<Invoice>('/payments/invoices', dto, { headers });
    return response.data;
  }

  /**
   * Get all invoices
   */
  async getInvoices(
    limit: number = 50,
    offset: number = 0,
    status?: InvoiceStatus
  ): Promise<{ data: readonly Invoice[]; total: number }> {
    const response = await this.axios.get('/payments/invoices', {
      params: { limit, offset, status },
    });
    return response.data;
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await this.axios.get<Invoice>(`/payments/invoices/${invoiceId}`);
    return response.data;
  }

  /**
   * Create a POS payment session
   */
  async createPOSSession(dto: CreatePOSSessionDto, idempotencyKey?: string): Promise<POSSession> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post<POSSession>('/payments/pos/sessions', dto, {
      headers,
    });
    return response.data;
  }

  /**
   * Get POS session status
   */
  async getPOSSession(sessionId: string): Promise<POSSession> {
    const response = await this.axios.get<POSSession>(`/payments/pos/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Onboard a merchant
   */
  async onboardMerchant(dto: OnboardMerchantDto, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post('/payments/merchants', dto, { headers });
    return response.data;
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
    idempotencyKey?: string
  ): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post('/payments/checkout-sessions', dto, { headers });
    return response.data;
  }

  /**
   * Get checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<any> {
    const response = await this.axios.get(`/payments/checkout-sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Create a product
   */
  async createProduct(dto: CreateProductDto, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post('/payments/products', dto, { headers });
    return response.data;
  }

  /**
   * Create a price for a product
   */
  async createPrice(dto: CreatePriceDto, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post('/payments/prices', dto, { headers });
    return response.data;
  }

  /**
   * Get product catalog
   */
  async getCatalog(orgId?: string): Promise<any> {
    const response = await this.axios.get('/payments/catalog', {
      params: orgId ? { orgId } : undefined,
    });
    return response.data;
  }

  /**
   * Create a customer
   */
  async createCustomer(dto: CreateCustomerDto, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post('/payments/customers', dto, { headers });
    return response.data;
  }

  /**
   * Create a subscription
   */
  async createSubscription(dto: CreateSubscriptionDto, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post('/payments/subscriptions', dto, { headers });
    return response.data;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post(
      `/payments/subscriptions/${subscriptionId}/cancel`,
      {},
      { headers }
    );
    return response.data;
  }

  /**
   * Create a refund
   */
  async createRefund(dto: CreateRefundDto, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post('/payments/refunds', dto, { headers });
    return response.data;
  }

  /**
   * Create a dispute
   */
  async createDispute(dto: CreateDisputeDto, idempotencyKey?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await this.axios.post('/payments/disputes', dto, { headers });
    return response.data;
  }

  /**
   * Get merchant settlements
   */
  async getSettlements(
    merchantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any> {
    const response = await this.axios.get(`/payments/merchants/${merchantId}/settlements`, {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get settlement details
   */
  async getSettlement(merchantId: string, settlementId: string): Promise<any> {
    const response = await this.axios.get(
      `/payments/merchants/${merchantId}/settlements/${settlementId}`
    );
    return response.data;
  }
}
