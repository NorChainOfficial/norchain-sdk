# @norchain/sdk

Official TypeScript/JavaScript SDK for the NorChain Unified API. Provides type-safe access to all NorChain blockchain services.

## Features

- **Comprehensive API Coverage**: All NorChain API endpoints organized into intuitive modules
- **Full TypeScript Support**: 100% type coverage with strict typing
- **Real-time Updates**: Built-in WebSocket client for live blockchain events
- **Automatic Retries**: Configurable retry logic with exponential backoff
- **Rate Limit Handling**: Automatic rate limit detection and retry-after support
- **Idempotency**: Built-in idempotency key generation for safe retries
- **Request Tracing**: Automatic trace ID injection for debugging
- **Error Handling**: Comprehensive error types and handling

## Installation

```bash
npm install @norchain/sdk
# or
yarn add @norchain/sdk
# or
pnpm add @norchain/sdk
```

## Quick Start

```typescript
import { NorChainClient } from '@norchain/sdk';

// Initialize the client
const client = new NorChainClient({
  baseUrl: 'https://api.norchain.org/api/v1',
  apiKey: 'nk_your_api_key_here',
  timeout: 30000,
  retries: 3
});

// Get account balance
const balance = await client.account.getBalance('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

// Get blockchain info
const validators = await client.blockchain.getValidators();

// Create a payment invoice
const invoice = await client.payment.createInvoice({
  amount: '100.00',
  currency: 'USDC',
  description: 'Payment for services'
});
```

## API Modules

The SDK is organized into the following modules:

### Account Module
```typescript
// Get account balance
await client.account.getBalance(address);

// Get account summary
await client.account.getSummary(address);
```

### Blockchain Module
```typescript
// Get state root for a block
await client.blockchain.getStateRoot(blockNumber);

// Get validators
await client.blockchain.getValidators();

// Get consensus info
await client.blockchain.getConsensusInfo();
```

### Token Module
```typescript
// Get token supply
await client.token.getSupply(contractAddress);

// Get token balance
await client.token.getBalance(contractAddress, address);

// Get token info
await client.token.getInfo(contractAddress);

// Get token transfers
await client.token.getTransfers(contractAddress, page, limit);
```

### Transaction Module
```typescript
// Broadcast a transaction
await client.transaction.broadcast({ signedTransaction });

// Get transaction details
await client.transaction.get(txHash);
```

### Payment Module
```typescript
// Create invoice
const invoice = await client.payment.createInvoice({
  amount: '100',
  currency: 'USDC',
  description: 'Payment'
});

// Create POS session
const session = await client.payment.createPOSSession({
  amount: '50',
  currency: 'USDC',
  merchantId: 'merchant_123'
});

// Onboard merchant
await client.payment.onboardMerchant({
  businessName: 'My Business',
  businessType: 'retail',
  country: 'US',
  email: 'contact@business.com',
  walletAddress: '0x...'
});

// Create checkout session
await client.payment.createCheckoutSession({
  amount: '100',
  currency: 'USDC',
  successUrl: 'https://mysite.com/success',
  cancelUrl: 'https://mysite.com/cancel'
});

// Get invoices
await client.payment.getInvoices(50, 0, 'pending');
```

### Swap Module
```typescript
// Get swap quote
const quote = await client.swap.getQuote({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: '1000000',
  chainId: 'NOR'
});

// Execute swap
const result = await client.swap.execute({
  quoteId: quote.id,
  signedTx: '0x...',
  userAddress: '0x...'
}, {
  idempotencyKey: client.generateIdempotencyKey()
});
```

### Order Module
```typescript
// Create limit order
const order = await client.order.createLimitOrder({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: '1000',
  limitPrice: '1.50',
  side: 'buy'
});

// Create stop-loss order
await client.order.createStopLossOrder({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: '1000',
  stopPrice: '0.95',
  side: 'sell'
});

// Create DCA order
await client.order.createDCAOrder({
  tokenIn: '0x...',
  tokenOut: '0x...',
  totalAmount: '10000',
  frequency: 'daily',
  numberOfOrders: 30
});

// Get order
const order = await client.order.get(orderId);

// Cancel order
await client.order.cancel(orderId);

// List orders
const orders = await client.order.list({ status: 'active' });
```

### Gas Module
```typescript
// Get current gas prices
const prices = await client.gas.getCurrentPrices();
console.log(prices); // { slow, standard, fast, instant }

// Get gas prediction
const prediction = await client.gas.getPrediction(10);

// Get gas history
const history = await client.gas.getHistory('1000', '2000');

// Estimate gas for transaction
const estimate = await client.gas.estimateGas({
  to: '0x...',
  data: '0x...',
  value: '1000000'
});
```

### Bridge Module
```typescript
// Get bridge quote
await client.bridge.getQuote({
  srcChain: 'NOR',
  dstChain: 'ETHEREUM',
  asset: 'USDC',
  amount: '1000'
});

// Create bridge transfer
await client.bridge.createTransfer({
  srcChain: 'NOR',
  dstChain: 'ETHEREUM',
  asset: 'USDC',
  amount: '1000',
  toAddress: '0x...'
});
```

### Governance Module
```typescript
// Get proposals
await client.governance.getProposals();

// Create proposal
await client.governance.createProposal({
  title: 'Increase block size',
  description: 'Proposal to increase block size to 2MB',
  type: 'parameter_change',
  parameters: { maxBlockSize: 2097152 }
});

// Vote on proposal
await client.governance.vote(proposalId, {
  choice: 'for',
  reason: 'I support this change'
});
```

### Compliance Module
```typescript
// Create screening
await client.compliance.createScreening({
  type: 'sanctions',
  subject: '0x...',
  notes: 'Routine check'
});

// Check travel rule
await client.compliance.checkTravelRule({
  senderAddress: '0x...',
  recipientAddress: '0x...',
  amount: '1000',
  asset: 'USDC'
});
```

### Wallet Module
```typescript
// Create wallet
const wallet = await client.wallet.create({
  name: 'My Wallet',
  password: 'secure_password'
});

// Import wallet
await client.wallet.import({
  mnemonic: 'word1 word2 ...',
  password: 'secure_password'
});

// Send transaction
await client.wallet.sendTransaction(walletId, {
  to: '0x...',
  amount: '1000000',
  password: 'secure_password'
});
```

### Auth Module
```typescript
// Login
const { token } = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Set token for authenticated requests
client.setToken(token);

// Refresh token
const { token: newToken } = await client.auth.refresh(refreshToken);

// Logout
await client.auth.logout();
```

## WebSocket Client

The SDK includes a WebSocket client for real-time updates:

```typescript
// Get WebSocket client
const ws = client.getWebSocket();

// Subscribe to new blocks
ws.onBlock((block) => {
  console.log('New block:', block);
});

// Subscribe to transactions with filter
const subscriptionId = ws.onTransaction((tx) => {
  console.log('New transaction:', tx);
}, { address: '0x...' });

// Subscribe to payment updates
ws.onPayment((payment) => {
  console.log('Payment update:', payment);
});

// Subscribe to order updates
ws.onOrder((order) => {
  console.log('Order update:', order);
});

// Subscribe to price updates
ws.onPrice((price) => {
  console.log('Price update:', price);
});

// Unsubscribe
ws.unsubscribe(subscriptionId);

// Disconnect
client.disconnectWebSocket();
```

## Authentication

### Using API Key
```typescript
const client = new NorChainClient({
  baseUrl: 'https://api.norchain.org/api/v1',
  apiKey: 'nk_your_api_key'
});
```

### Using JWT Token
```typescript
const client = new NorChainClient({
  baseUrl: 'https://api.norchain.org/api/v1',
  token: 'your_jwt_token'
});

// Or set token after initialization
client.setToken('your_jwt_token');
```

## Idempotency

For operations that modify state, use idempotency keys to ensure safe retries:

```typescript
const idempotencyKey = client.generateIdempotencyKey();

const invoice = await client.payment.createInvoice({
  amount: '100',
  currency: 'USDC'
}, idempotencyKey);

// If the request fails and is retried with the same key,
// you'll get the same invoice back instead of creating a duplicate
```

## Error Handling

```typescript
try {
  const balance = await client.account.getBalance(address);
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Account not found');
  } else if (error.response?.status === 429) {
    console.error('Rate limited. Retry after:', error.retryAfter);
  } else {
    console.error('API error:', error.message);
  }
}
```

## Configuration Options

```typescript
const client = new NorChainClient({
  // Required: API base URL
  baseUrl: 'https://api.norchain.org/api/v1',

  // Optional: API key for authentication
  apiKey: 'nk_your_api_key',

  // Optional: JWT token for authentication
  token: 'your_jwt_token',

  // Optional: Request timeout in milliseconds (default: 30000)
  timeout: 30000,

  // Optional: Number of retry attempts (default: 3)
  retries: 3,

  // Optional: Base retry delay in milliseconds (default: 1000)
  retryDelay: 1000,

  // Optional: WebSocket configuration
  websocket: {
    url: 'wss://api.norchain.org/ws',
    apiKey: 'nk_your_api_key',
    reconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  }
});
```

## TypeScript Support

The SDK is written in TypeScript and provides complete type definitions:

```typescript
import {
  NorChainClient,
  Invoice,
  Order,
  TokenInfo,
  TransactionReceipt
} from '@norchain/sdk';

const client = new NorChainClient({ /* ... */ });

// All methods are fully typed
const invoice: Invoice = await client.payment.createInvoice({
  amount: '100',
  currency: 'USDC'
});

// TypeScript will catch errors at compile time
const order: Order = await client.order.get('order_123');
```

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/norchain/sdk
- Documentation: https://docs.norchain.org
- Discord: https://discord.gg/norchain
