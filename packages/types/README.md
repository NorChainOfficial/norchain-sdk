# @norchain/types

Shared TypeScript type definitions for the NorChain ecosystem.

## Overview

This package provides comprehensive type definitions used across all NorChain applications including the API, Explorer, NEX Exchange, and other frontend applications. It ensures type safety and consistency across the entire monorepo.

## Installation

This package is part of the NorChain monorepo and is automatically available to all workspace packages.

```bash
npm install @norchain/types
```

## Usage

Import types in your TypeScript files:

```typescript
import type {
  Transaction,
  Block,
  AccountBalance,
  Token,
  ApiResponse,
} from '@norchain/types';

// Use in your code
const fetchBalance = async (address: string): Promise<ApiResponse<AccountBalance>> => {
  // Implementation
};
```

## Available Type Modules

### Common Types
Basic types used throughout the ecosystem:
- `Address` - Ethereum-compatible addresses
- `Hash` - Transaction/block hashes
- `Wei` - Wei value representation
- `Timestamp` - Unix timestamps
- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Paginated data wrapper

### Blockchain Types
Core blockchain data structures:
- `NetworkInfo` - Chain configuration
- `Validator` - Validator information
- `StateRoot` - State root data
- `ConsensusInfo` - Consensus details
- `ChainStats` - Chain statistics

### Account Types
Account-related types:
- `AccountBalance` - Account balance info
- `AccountSummary` - Detailed account data
- `AccountToken` - Token holdings
- `InternalTransaction` - Internal transactions

### Transaction Types
Transaction data structures:
- `Transaction` - Core transaction data
- `TransactionReceipt` - Transaction receipt
- `TransactionLog` - Event logs
- `TransactionStatus` - Transaction status
- `BroadcastTransactionRequest/Response` - Broadcasting

### Block Types
Block-related types:
- `Block` - Complete block data
- `BlockSummary` - Lightweight block info
- `BlockReward` - Block rewards
- `BlockWithTransactions` - Block with full tx data

### Token Types
Token and NFT types:
- `Token` - ERC20/721/1155 token info
- `TokenMetadata` - Extended token data
- `TokenTransfer` - Transfer events
- `NFTTransfer` - NFT transfer events
- `TokenHolder` - Holder information
- `NFTMetadata` - NFT metadata

### Payment Types
Payment system types:
- `Payment` - Payment information
- `Invoice` - Invoice data
- `Subscription` - Subscription details
- `Merchant` - Merchant information
- `CheckoutSession` - Checkout sessions
- `Refund` - Refund information

### Validator Types
Staking and validator types:
- `ValidatorDetails` - Detailed validator info
- `Delegation` - Delegation data
- `StakingRewards` - Reward information
- `ValidatorPerformance` - Performance metrics
- `UnbondingDelegation` - Unbonding info

### Governance Types
DAO and governance types:
- `Proposal` - Governance proposals
- `Vote` - Vote information
- `GovernanceParams` - Governance parameters
- `ProposalTally` - Vote tallying

### Compliance Types
Regulatory compliance types:
- `KYCInfo` - KYC status and data
- `PolicyCheckResult` - Policy compliance
- `AMLScreeningResult` - AML screening
- `ShariaComplianceCheck` - Sharia compliance

### API Types
API client types:
- `RequestConfig` - API request config
- `ApiClientOptions` - Client configuration
- `RateLimitInfo` - Rate limiting
- `HealthCheckResponse` - Health checks
- `WebSocketMessage` - WebSocket messages

## Type Safety Guidelines

### Readonly Properties
All interface properties are marked `readonly` to prevent accidental mutations:

```typescript
interface Transaction {
  readonly hash: Hash;
  readonly from: Address;
  readonly to: Address;
  // ...
}
```

### Branded Types
We use branded types for type safety:

```typescript
type Address = `0x${string}`;  // Must start with 0x
type Hash = `0x${string}`;
```

### Strict Null Checks
All types are designed for `strictNullChecks` mode:

```typescript
interface Block {
  readonly number: number;
  readonly hash: Hash;
  readonly miner: Address;
  readonly uncles?: readonly Hash[];  // Optional with explicit undefined
}
```

### Generic Response Types
Use generic wrappers for API responses:

```typescript
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

const response: ApiResponse<AccountBalance> = await api.getBalance(address);
```

## Development

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Clean

```bash
npm run clean
```

## Type Coverage

This package provides 100% type coverage for:
- All API endpoints and responses
- Blockchain data structures
- Payment system entities
- Governance and compliance
- WebSocket events
- Client configurations

## Best Practices

1. **Import Types Only**: Use `import type` for type-only imports
   ```typescript
   import type { Transaction } from '@norchain/types';
   ```

2. **Use Readonly**: All data structures use readonly properties
3. **Avoid Any**: No `any` types - use `unknown` for truly unknown data
4. **Branded Types**: Use branded types for domain-specific strings
5. **Generic Responses**: Wrap responses in `ApiResponse<T>` or `PaginatedResponse<T>`

## Contributing

When adding new types:
1. Create a new file in `src/` for logical grouping
2. Export all types from `src/index.ts`
3. Use strict TypeScript mode
4. Mark all properties as `readonly`
5. Document complex types with JSDoc comments
6. Update this README with new type modules

## License

MIT
