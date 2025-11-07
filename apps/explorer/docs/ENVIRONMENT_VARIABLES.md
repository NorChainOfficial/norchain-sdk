# Environment Variables Documentation

This document describes all environment variables used in the Xaheen Chain Explorer.

## Table of Contents
- [API Configuration](#api-configuration)
- [RPC Configuration](#rpc-configuration)
- [Chain Configuration](#chain-configuration)
- [Feature Flags](#feature-flags)
- [Performance Settings](#performance-settings)
- [Explorer Settings](#explorer-settings)
- [URLs](#urls)
- [Smart Contracts](#smart-contracts)

---

## API Configuration

### `NEXT_PUBLIC_API_URL`
**Type:** `string` (URL)
**Required:** Yes
**Default:** `http://localhost:4000/api/v1`

The base URL for the Xaheen SDK backend API.

**Examples:**
```env
# Local development
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Production
NEXT_PUBLIC_API_URL=https://explorer.xaheen.org/api/v1

# Staging
NEXT_PUBLIC_API_URL=https://staging-api.xaheen.org/api/v1
```

**Used for:**
- Fetching blockchain data (blocks, transactions, accounts)
- Retrieving network statistics
- Accessing validator information
- Smart contract data

---

## RPC Configuration

### `NEXT_PUBLIC_RPC_URL`
**Type:** `string` (URL)
**Required:** Yes
**Default:** `http://localhost:8545`

The RPC endpoint for direct blockchain queries.

**Examples:**
```env
# Local development
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# Production
NEXT_PUBLIC_RPC_URL=https://rpc.xaheen.org

# Alternative RPC
NEXT_PUBLIC_RPC_URL=https://rpc2.xaheen.org
```

**Used for:**
- Direct blockchain queries
- Web3 provider connection
- Transaction broadcasting
- Contract interactions

---

### `NEXT_PUBLIC_CHAIN_ID`
**Type:** `number`
**Required:** Yes
**Default:** `885824`

The chain ID for the Xaheen blockchain network.

**Example:**
```env
NEXT_PUBLIC_CHAIN_ID=885824
```

**Used for:**
- Network identification
- Transaction signing
- Wallet connections
- Chain verification

---

## Chain Configuration

### `NEXT_PUBLIC_DENOM`
**Type:** `string`
**Required:** Yes
**Default:** `XHN`

The native token denomination.

**Example:**
```env
NEXT_PUBLIC_DENOM=XHN
```

---

### `NEXT_PUBLIC_DECIMALS`
**Type:** `number`
**Required:** Yes
**Default:** `18`

The number of decimal places for the native token.

**Example:**
```env
NEXT_PUBLIC_DECIMALS=18
```

**Used for:**
- Token amount conversion
- Display formatting
- Wei to token calculations

---

### `NEXT_PUBLIC_NETWORK_NAME`
**Type:** `string`
**Required:** Yes
**Default:** `Xaheen Chain`

The human-readable network name displayed in the UI.

**Examples:**
```env
# Production
NEXT_PUBLIC_NETWORK_NAME=Xaheen Chain

# Testnet
NEXT_PUBLIC_NETWORK_NAME=Xaheen Testnet

# Local
NEXT_PUBLIC_NETWORK_NAME=Xaheen Chain (Local)
```

---

### `NEXT_PUBLIC_CURRENCY_SYMBOL`
**Type:** `string`
**Required:** Yes
**Default:** `XHN`

The currency symbol displayed throughout the UI.

**Example:**
```env
NEXT_PUBLIC_CURRENCY_SYMBOL=XHN
```

---

### `NEXT_PUBLIC_TOTAL_SUPPLY`
**Type:** `string` (large number)
**Required:** No
**Default:** `21000000000000000000000000`

The total supply of the native token (in smallest unit).

**Example:**
```env
# 21 million tokens with 18 decimals
NEXT_PUBLIC_TOTAL_SUPPLY=21000000000000000000000000
```

---

## Feature Flags

### `NEXT_PUBLIC_ENABLE_FAUCET`
**Type:** `boolean`
**Required:** No
**Default:** `false`

Enable or disable the testnet faucet feature.

**Examples:**
```env
# Enable for development/testnet
NEXT_PUBLIC_ENABLE_FAUCET=true

# Disable for production
NEXT_PUBLIC_ENABLE_FAUCET=false
```

**When enabled:**
- Faucet UI component is displayed
- Users can request test tokens
- Should be disabled in production

---

### `NEXT_PUBLIC_ENABLE_ANALYTICS`
**Type:** `boolean`
**Required:** No
**Default:** `true`

Enable or disable analytics and monitoring features.

**Example:**
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

**When enabled:**
- Performance monitoring
- User analytics
- Error tracking
- Usage statistics

---

## Performance Settings

### `NEXT_PUBLIC_BLOCK_REFRESH_INTERVAL`
**Type:** `number` (milliseconds)
**Required:** No
**Default:** `3000`

How often to refresh block data (in milliseconds).

**Examples:**
```env
# Fast refresh (3 seconds)
NEXT_PUBLIC_BLOCK_REFRESH_INTERVAL=3000

# Slower refresh (10 seconds) - reduces server load
NEXT_PUBLIC_BLOCK_REFRESH_INTERVAL=10000
```

**Considerations:**
- Lower values = more real-time data, higher server load
- Higher values = less server load, less real-time feel
- Balance between UX and performance

---

### `NEXT_PUBLIC_STATS_REFRESH_INTERVAL`
**Type:** `number` (milliseconds)
**Required:** No
**Default:** `5000`

How often to refresh statistics data (in milliseconds).

**Example:**
```env
NEXT_PUBLIC_STATS_REFRESH_INTERVAL=5000
```

---

## Explorer Settings

### `NEXT_PUBLIC_BLOCKS_PER_PAGE`
**Type:** `number`
**Required:** No
**Default:** `20`

Number of blocks to display per page in the blocks listing.

**Examples:**
```env
# Standard pagination
NEXT_PUBLIC_BLOCKS_PER_PAGE=20

# More items per page
NEXT_PUBLIC_BLOCKS_PER_PAGE=50
```

---

### `NEXT_PUBLIC_TXS_PER_PAGE`
**Type:** `number`
**Required:** No
**Default:** `20`

Number of transactions to display per page in the transactions listing.

**Example:**
```env
NEXT_PUBLIC_TXS_PER_PAGE=20
```

---

## URLs

### `NEXT_PUBLIC_EXPLORER_URL`
**Type:** `string` (URL)
**Required:** No
**Default:** Derived from request

The public URL where the explorer is hosted.

**Examples:**
```env
# Production
NEXT_PUBLIC_EXPLORER_URL=https://explorer.xaheen.org

# Development
NEXT_PUBLIC_EXPLORER_URL=http://localhost:3000
```

**Used for:**
- Social sharing metadata
- Canonical URLs
- Sitemap generation

---

### `NEXT_PUBLIC_DOCS_URL`
**Type:** `string` (URL)
**Required:** No
**Default:** None

URL to the documentation site.

**Example:**
```env
NEXT_PUBLIC_DOCS_URL=https://docs.xaheen.org
```

---

## Smart Contracts

These are optional and only needed if DeFi features are enabled.

### `NEXT_PUBLIC_WXHN_ADDRESS`
**Type:** `string` (Ethereum address)
**Required:** No
**Default:** None

The address of the Wrapped XHN (WXHN) token contract.

**Example:**
```env
NEXT_PUBLIC_WXHN_ADDRESS=0x1234567890123456789012345678901234567890
```

---

### `NEXT_PUBLIC_FACTORY_ADDRESS`
**Type:** `string` (Ethereum address)
**Required:** No
**Default:** None

The address of the DEX factory contract (Uniswap V2 style).

**Example:**
```env
NEXT_PUBLIC_FACTORY_ADDRESS=0x1234567890123456789012345678901234567890
```

---

### `NEXT_PUBLIC_ROUTER_ADDRESS`
**Type:** `string` (Ethereum address)
**Required:** No
**Default:** None

The address of the DEX router contract.

**Example:**
```env
NEXT_PUBLIC_ROUTER_ADDRESS=0x1234567890123456789012345678901234567890
```

---

### `NEXT_PUBLIC_FLASHCOIN_ADDRESS`
**Type:** `string` (Ethereum address)
**Required:** No
**Default:** None

The address of the FlashCoin contract (time-locked transfers).

**Example:**
```env
NEXT_PUBLIC_FLASHCOIN_ADDRESS=0x1234567890123456789012345678901234567890
```

---

## Environment File Priority

Next.js loads environment variables in the following order (later files override earlier ones):

1. `.env` - All environments
2. `.env.local` - All environments (ignored by git)
3. `.env.development` - Development only
4. `.env.production` - Production only
5. `.env.development.local` - Development only (ignored by git)
6. `.env.production.local` - Production only (ignored by git)

---

## Security Best Practices

### Public Variables
All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive data in these variables:

**✅ Safe:**
```env
NEXT_PUBLIC_API_URL=https://api.xaheen.org
NEXT_PUBLIC_NETWORK_NAME=Xaheen Chain
```

**❌ Unsafe:**
```env
NEXT_PUBLIC_ADMIN_PASSWORD=secret123
NEXT_PUBLIC_PRIVATE_KEY=0x1234...
```

### Private Variables
Variables without the `NEXT_PUBLIC_` prefix are only available in server-side code:

**✅ Correct:**
```env
DATABASE_URL=postgresql://user:pass@host/db
API_SECRET_KEY=your-secret-key
PRIVATE_KEY=0x1234...
```

---

## Validation

The application validates required environment variables on startup. Missing or invalid variables will cause the application to fail with descriptive error messages.

**Required Variables:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_DENOM`
- `NEXT_PUBLIC_NETWORK_NAME`

---

## Quick Setup

### Development
```bash
cp .env.example .env.local
# Edit .env.local with your local values
npm run dev
```

### Production
```bash
cp .env.example .env.production
# Edit .env.production with production values
npm run build
npm run start
```

---

## Troubleshooting

### Variables Not Loading
1. Restart the development server after changing `.env` files
2. Ensure variables are prefixed with `NEXT_PUBLIC_` for browser access
3. Check for typos in variable names
4. Verify the file is named correctly (`.env.local` not `env.local`)

### Build-Time Variables
Environment variables are embedded at build time. If you change production variables, you must rebuild:

```bash
npm run build
```

### Runtime Updates
To update variables without rebuilding, use server-side environment variables (without `NEXT_PUBLIC_` prefix) and access them through API routes.

---

## Support

For questions about environment configuration:
- Documentation: https://docs.xaheen.org
- Support: support@xaheen.org
- GitHub: https://github.com/xaheenchain/explorer/issues
