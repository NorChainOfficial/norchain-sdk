/**
 * Payment-related types
 */

import type { Address, Wei, Timestamp, ISODateString } from './common';

/**
 * Payment method type
 */
export type PaymentMethod = 'crypto' | 'card' | 'bank_transfer' | 'mobile_money';

/**
 * Payment status
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Currency type
 */
export type Currency = 'NOR' | 'USD' | 'EUR' | 'NOK' | 'AED' | 'SAR';

/**
 * Payment information
 */
export interface Payment {
  readonly id: string;
  readonly merchantId: string;
  readonly amount: Wei;
  readonly currency: Currency;
  readonly status: PaymentStatus;
  readonly method: PaymentMethod;
  readonly description?: string;
  readonly customerAddress?: Address;
  readonly recipientAddress?: Address;
  readonly transactionHash?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly completedAt?: Timestamp;
}

/**
 * Invoice information
 */
export interface Invoice {
  readonly id: string;
  readonly merchantId: string;
  readonly invoiceNumber: string;
  readonly description: string;
  readonly amount: Wei;
  readonly currency: Currency;
  readonly status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  readonly dueDate?: ISODateString;
  readonly paidAt?: Timestamp;
  readonly recipientAddress?: Address;
  readonly paymentMethod?: PaymentMethod;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Subscription information
 */
export interface Subscription {
  readonly id: string;
  readonly merchantId: string;
  readonly customerId: string;
  readonly planId: string;
  readonly amount: Wei;
  readonly currency: Currency;
  readonly interval: 'day' | 'week' | 'month' | 'year';
  readonly intervalCount: number;
  readonly status: 'active' | 'paused' | 'cancelled' | 'past_due';
  readonly currentPeriodStart: Timestamp;
  readonly currentPeriodEnd: Timestamp;
  readonly cancelAt?: Timestamp;
  readonly cancelledAt?: Timestamp;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Merchant information
 */
export interface Merchant {
  readonly id: string;
  readonly businessName: string;
  readonly email: string;
  readonly walletAddress: Address;
  readonly status: 'pending' | 'active' | 'suspended' | 'deactivated';
  readonly kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  readonly settlementCurrency: Currency;
  readonly apiKey?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Checkout session
 */
export interface CheckoutSession {
  readonly id: string;
  readonly merchantId: string;
  readonly amount: Wei;
  readonly currency: Currency;
  readonly description?: string;
  readonly successUrl?: string;
  readonly cancelUrl?: string;
  readonly customerEmail?: string;
  readonly expiresAt: Timestamp;
  readonly status: 'open' | 'completed' | 'expired';
  readonly paymentId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
}

/**
 * Refund information
 */
export interface Refund {
  readonly id: string;
  readonly paymentId: string;
  readonly amount: Wei;
  readonly currency: Currency;
  readonly reason?: string;
  readonly status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  readonly transactionHash?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
  readonly processedAt?: Timestamp;
}

/**
 * Product information
 */
export interface Product {
  readonly id: string;
  readonly merchantId: string;
  readonly name: string;
  readonly description?: string;
  readonly images?: readonly string[];
  readonly active: boolean;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Price information
 */
export interface Price {
  readonly id: string;
  readonly productId: string;
  readonly amount: Wei;
  readonly currency: Currency;
  readonly type: 'one_time' | 'recurring';
  readonly interval?: 'day' | 'week' | 'month' | 'year';
  readonly intervalCount?: number;
  readonly active: boolean;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Timestamp;
}
