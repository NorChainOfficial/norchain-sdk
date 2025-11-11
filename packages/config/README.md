# @norchain/config

Shared configuration and constants for the NorChain ecosystem.

## Overview

This package provides centralized configuration management, constants, and environment variable helpers used across all NorChain applications. It ensures consistency and makes it easy to manage application settings across the monorepo.

## Installation

This package is part of the NorChain monorepo and is automatically available to all workspace packages.

```bash
npm install @norchain/config
```

## Usage

### Constants

Import and use predefined constants:

```typescript
import {
  CHAIN_IDS,
  NATIVE_TOKEN_SYMBOL,
  PAGINATION,
  API_VERSION,
} from '@norchain/config';

console.log(CHAIN_IDS.MAINNET); // 2022
console.log(NATIVE_TOKEN_SYMBOL); // 'NOR'
console.log(PAGINATION.DEFAULT_LIMIT); // 20
```

### Network Configuration

Access network configurations for different environments:

```typescript
import {
  MAINNET_CONFIG,
  TESTNET_CONFIG,
  DEVNET_CONFIG,
  getNetworkByChainId,
  isSupportedChainId,
} from '@norchain/config';

// Use predefined configs
const mainnet = MAINNET_CONFIG;
console.log(mainnet.rpcUrl); // 'https://rpc.norchain.io'

// Get network by chain ID
const network = getNetworkByChainId(2022);
console.log(network?.chainName); // 'NorChain Mainnet'

// Check if chain ID is supported
if (isSupportedChainId(chainId)) {
  // Process transaction
}
```

### API Configuration

Use API endpoints and configuration:

```typescript
import { API_ENDPOINTS, buildEndpoint, API_CONFIG } from '@norchain/config';

// Use endpoint constants
const balanceUrl = `${baseUrl}${API_ENDPOINTS.ACCOUNT.BALANCE}`;

// Build endpoint with params
const validatorUrl = buildEndpoint(
  baseUrl,
  API_ENDPOINTS.VALIDATOR.INFO,
  { address: '0x123...' }
);

// Use API config defaults
fetch(url, {
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});
```

### Environment Variables

Safely access and validate environment variables:

```typescript
import {
  getEnv,
  getRequiredEnv,
  getEnvAsNumber,
  getEnvAsBoolean,
  getCurrentEnvironment,
  isProduction,
  validateEnv,
} from '@norchain/config';

// Get with fallback
const apiUrl = getEnv('API_URL', 'http://localhost:4000');

// Get required (throws if missing)
const dbUrl = getRequiredEnv('DATABASE_URL');

// Get as number
const port = getEnvAsNumber('PORT', 4000);

// Get as boolean
const enableCache = getEnvAsBoolean('ENABLE_CACHE', true);

// Check environment
if (isProduction()) {
  // Production-specific logic
}

// Validate required vars
validateEnv(['DATABASE_URL', 'REDIS_HOST', 'JWT_SECRET']);
```

### Default Configuration

Access default settings:

```typescript
import {
  DEFAULT_NETWORK,
  DEFAULT_PAGINATION,
  DEFAULT_API_CONFIG,
  DEFAULT_TX_CONFIG,
  getDefaultConfig,
} from '@norchain/config';

// Use individual defaults
const limit = DEFAULT_PAGINATION.limit;

// Get complete config
const config = getDefaultConfig('production');
console.log(config.network.rpcUrl);
console.log(config.pagination.limit);
console.log(config.features.ENABLE_STAKING);
```

## Available Modules

### Constants (`constants.ts`)

Core constants used throughout the ecosystem:

- **Chain IDs**: `CHAIN_IDS` - Mainnet, Testnet, Devnet
- **Token Info**: `NATIVE_TOKEN_SYMBOL`, `NATIVE_TOKEN_DECIMALS`
- **Blockchain**: `BLOCK_TIME`, `BLOCKS_PER_EPOCH`, `MAX_GAS_LIMIT`
- **Addresses**: `ZERO_ADDRESS`, `ZERO_HASH`
- **Staking**: `MIN_VALIDATOR_STAKE`, `UNBONDING_PERIOD`
- **Governance**: `MIN_PROPOSAL_DEPOSIT`, `VOTING_PERIOD`
- **Currencies**: `SUPPORTED_CURRENCIES`
- **Pagination**: `PAGINATION` defaults
- **Rate Limits**: `RATE_LIMITS`
- **WebSocket**: `WS_EVENTS`
- **Cache**: `CACHE_TTL` values

### Networks (`networks.ts`)

Network configurations for all environments:

- `MAINNET_CONFIG` - Production network
- `TESTNET_CONFIG` - Testing network
- `DEVNET_CONFIG` - Local development
- `getNetworkByChainId(chainId)` - Find network by chain ID
- `getNetworkByName(name)` - Find network by name
- `isSupportedChainId(chainId)` - Validate chain ID

Each network config includes:
- Chain ID and name
- RPC, Explorer, API, WebSocket URLs
- Native currency details
- Block time
- Testnet flag

### API (`api.ts`)

API endpoint paths and configuration:

- `API_ENDPOINTS` - All API endpoint paths organized by module
- `API_CONFIG` - Request configuration defaults
- `WS_CHANNELS` - WebSocket channel names
- `API_ERROR_CODES` - Standard error codes
- `buildEndpoint(baseUrl, path, params)` - Build URLs with params

### Environment (`env.ts`)

Environment variable helpers:

- `getEnv(key, fallback)` - Get with optional fallback
- `getRequiredEnv(key)` - Get required (throws if missing)
- `getEnvAsNumber(key, fallback)` - Parse as number
- `getEnvAsBoolean(key, fallback)` - Parse as boolean
- `getCurrentEnvironment()` - Get current env
- `isProduction()` - Check if production
- `isDevelopment()` - Check if development
- `isTest()` - Check if test
- `validateEnv(keys)` - Validate required vars

### Defaults (`defaults.ts`)

Default configuration values:

- `DEFAULT_NETWORK` - Default network (devnet)
- `DEFAULT_PAGINATION` - Pagination settings
- `DEFAULT_CACHE` - Cache settings
- `DEFAULT_RATE_LIMIT` - Rate limit settings
- `DEFAULT_API_CONFIG` - API client config
- `DEFAULT_WS_CONFIG` - WebSocket config
- `DEFAULT_TX_CONFIG` - Transaction config
- `DEFAULT_VALIDATOR_CONFIG` - Validator settings
- `DEFAULT_GOVERNANCE_CONFIG` - Governance parameters
- `DEFAULT_PAYMENT_CONFIG` - Payment settings
- `FEATURE_FLAGS` - Feature toggles
- `getDefaultConfig(env)` - Get complete config for environment

## Type Safety

All configuration is fully typed with TypeScript:

```typescript
import type { ChainId, SupportedCurrency, NetworkConfig } from '@norchain/config';

const chainId: ChainId = CHAIN_IDS.MAINNET; // Type-safe
const currency: SupportedCurrency = 'NOR'; // Type-safe
const network: NetworkConfig = MAINNET_CONFIG; // Fully typed
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

## Usage Examples

### Frontend Application

```typescript
import { DEVNET_CONFIG, API_ENDPOINTS } from '@norchain/config';

const apiUrl = DEVNET_CONFIG.apiUrl;
const balanceEndpoint = API_ENDPOINTS.ACCOUNT.BALANCE;

const response = await fetch(`${apiUrl}${balanceEndpoint}?address=${addr}`);
```

### Backend Service

```typescript
import {
  getRequiredEnv,
  CACHE_TTL,
  RATE_LIMITS,
} from '@norchain/config';

const dbUrl = getRequiredEnv('DATABASE_URL');
const cacheTtl = CACHE_TTL.MEDIUM;
const rateLimit = RATE_LIMITS.DEFAULT_LIMIT;
```

### WebSocket Client

```typescript
import { DEVNET_CONFIG, WS_CHANNELS, WS_EVENTS } from '@norchain/config';

const ws = new WebSocket(DEVNET_CONFIG.wsUrl);
ws.send({ channel: WS_CHANNELS.BLOCKS });
ws.on(WS_EVENTS.NEW_BLOCK, handleBlock);
```

## Best Practices

1. **Use Constants**: Always use constants instead of hardcoded values
2. **Environment Variables**: Use helper functions for env var access
3. **Type Safety**: Import types for type-safe configurations
4. **Validation**: Validate required env vars on startup
5. **Defaults**: Use default configs as fallbacks
6. **Network Detection**: Use helper functions to detect/validate networks

## Contributing

When adding new configuration:

1. Add constants to appropriate file (`constants.ts`, `networks.ts`, etc.)
2. Export types for type safety
3. Update defaults if needed
4. Add helper functions for common operations
5. Document in this README
6. Use `readonly` for immutable values

## License

MIT
