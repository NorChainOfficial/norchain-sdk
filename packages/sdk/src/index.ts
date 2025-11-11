/**
 * NorChain TypeScript SDK
 *
 * A comprehensive, type-safe client library for interacting with the NorChain Unified API.
 * Provides modular access to all blockchain services including payments, swaps, governance, and more.
 *
 * @packageDocumentation
 */

// Main client exports
export { NorChainClient, NorClient, NorChainClientConfig, RequestConfig } from './client';

// WebSocket client
export { WebSocketClient, WebSocketConfig, WebSocketEvent, WebSocketMessage, SubscriptionOptions } from './websocket';

// Module exports
export { AccountModule } from './modules/account';
export { AuthModule } from './modules/auth';
export { BlockchainModule, StateRootResponse, ValidatorInfo, ValidatorsResponse, ConsensusInfo } from './modules/blockchain';
export { BridgeModule } from './modules/bridge';
export { ComplianceModule } from './modules/compliance';
export { GasModule } from './modules/gas';
export { GovernanceModule } from './modules/governance';
export {
  OrderModule,
  CreateLimitOrderDto,
  CreateStopLossOrderDto,
  CreateDCAOrderDto,
  Order,
  OrdersListResponse,
  OrderType,
  OrderStatus,
  OrderSide
} from './modules/order';
export {
  PaymentModule,
  CreateInvoiceDto,
  Invoice,
  CreatePOSSessionDto,
  POSSession,
  OnboardMerchantDto,
  CreateCheckoutSessionDto,
  CreateProductDto,
  CreatePriceDto,
  CreateCustomerDto,
  CreateSubscriptionDto,
  CreateRefundDto,
  CreateDisputeDto,
  InvoiceStatus,
  PaymentStatus,
  SubscriptionStatus
} from './modules/payment';
export { SwapModule, GetQuoteDto, ExecuteSwapDto } from './modules/swap';
export {
  TokenModule,
  TokenSupplyResponse,
  TokenBalanceResponse,
  TokenInfo,
  TokenTransfer,
  TokenTransfersResponse
} from './modules/token';
export { TransactionModule, BroadcastTransactionDto } from './modules/transaction';
export { WalletModule } from './modules/wallet';

// Utility exports
export * from './utils';

// Legacy types for backwards compatibility
export * from './types';

// Default export
export { NorChainClient as default } from './client';
