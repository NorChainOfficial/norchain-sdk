# NorChain TypeScript SDK

A type-safe client library for interacting with the NorChain Unified API.

## Installation

```bash
npm install @norchain/sdk
```

## Usage

### Basic Setup

```typescript
import { NorClient } from '@norchain/sdk';

const nor = new NorClient({
  baseUrl: 'https://api.norchain.org',
  apiKey: 'your-api-key', // Optional
  token: 'your-jwt-token', // Optional
});
```

### Authentication

```typescript
// Login and set token
const loginResponse = await nor.auth.login({
  email: 'user@example.com',
  password: 'password',
});

nor.setToken(loginResponse.access_token);
```

### Account Operations

```typescript
// Get balance
const balance = await nor.account.getBalance('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
```

### Bridge Operations

```typescript
import { generateIdempotencyKey } from '@norchain/sdk/utils';

// Get quote
const quote = await nor.bridge.getQuote({
  srcChain: 'NOR',
  dstChain: 'BSC',
  asset: 'BTCBR',
  amount: '1000000000000000000',
});

// Create transfer with idempotency
const transfer = await nor.bridge.createTransfer(
  {
    srcChain: 'NOR',
    dstChain: 'BSC',
    asset: 'BTCBR',
    amount: '1000000000000000000',
    toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  },
  { idempotencyKey: generateIdempotencyKey() }
);

// Get transfer status
const status = await nor.bridge.getTransfer(transfer.transfer_id);
```

### Governance Operations

```typescript
// Get proposals
const proposals = await nor.governance.getProposals(50, 0, 'active');

// Create proposal
const proposal = await nor.governance.createProposal(
  {
    title: 'Increase Validator Staking',
    description: 'Proposal to increase minimum staking requirement',
    type: 'parameter_change',
    parameters: { minStake: '50000' },
  },
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
);

// Submit vote
await nor.governance.submitVote(
  proposal.proposal_id,
  { choice: 'for', reason: 'I support this proposal' },
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
);

// Get tally
const tally = await nor.governance.getTally(proposal.proposal_id);
```

### Compliance Operations

```typescript
// Create screening
const screening = await nor.compliance.createScreening({
  type: 'sanctions',
  subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
});

// Get risk score
const riskScore = await nor.compliance.getRiskScore('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
```

### Swap Operations

```typescript
import { wei } from '@norchain/sdk/utils';

// Get quote
const quote = await nor.swap.getQuote({
  tokenIn: 'NOR',
  tokenOut: 'USDT',
  amountIn: wei('1'),
  chainId: '65001',
});

// Execute swap
await nor.swap.execute(
  {
    quoteId: quote.quoteId,
    signedTx: '0x...',
    userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  },
  { idempotencyKey: generateIdempotencyKey() }
);
```

## Features

- ✅ Type-safe API client
- ✅ Automatic retry with exponential backoff
- ✅ Idempotency key support
- ✅ Request/response interceptors
- ✅ Error handling
- ✅ Trace ID generation

## Error Handling

The SDK automatically handles errors and retries on network failures or 5xx errors. Errors follow the standard error envelope:

```typescript
try {
  await nor.bridge.createTransfer(...);
} catch (error) {
  if (error.response) {
    const errorData = error.response.data.error;
    console.error(errorData.code); // Error code
    console.error(errorData.message); // Error message
    console.error(errorData.trace_id); // Trace ID for debugging
  }
}
```

## License

MIT
