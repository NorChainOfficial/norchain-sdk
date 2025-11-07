# @norchain/sdk

Official JavaScript/TypeScript SDK for the NorChain ecosystem.

## Installation

```bash
npm install @norchain/sdk
```

## Quick Start

```typescript
import { createSDK } from '@norchain/sdk'

// Create SDK instance
const sdk = createSDK({
  apiUrl: 'http://localhost:4000',
  rpcUrl: 'https://rpc.norchain.org',
  chainId: 65001,
})

// Use SDK
const stats = await sdk.api.getStats()
const balance = await sdk.wallet.getBalance('0x...')
const block = await sdk.explorer.getBlock(12345)
const quote = await sdk.exchange.getSwapQuote('NOR', 'USDT', '100')
```

## API Reference

### API Client
```typescript
sdk.api.health()
sdk.api.getStats()
```

### Wallet Client
```typescript
sdk.wallet.getBalance(address)
sdk.wallet.getTransactions(address, limit)
sdk.wallet.getAccountInfo(address)
```

### Explorer Client
```typescript
sdk.explorer.getBlock(height)
sdk.explorer.getLatestBlocks(limit)
sdk.explorer.getTransaction(hash)
sdk.explorer.getLatestTransactions(limit)
```

### Exchange Client
```typescript
sdk.exchange.getSwapQuote(fromToken, toToken, amount)
sdk.exchange.executeSwap(quoteId, signedTx)
sdk.exchange.getPrices()
sdk.exchange.getPortfolio(address)
```

## License

MIT

