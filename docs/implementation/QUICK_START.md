# Quick Start Guide
## Using the New Interactive Components & SDK

---

## 🚀 Installation

### 1. Install Dependencies

```bash
# Install framer-motion for animations
npm install framer-motion --workspace=@norchain/explorer
npm install framer-motion --workspace=@norchain/landing
npm install framer-motion --workspace=@norchain/nex-exchange

# Install lucide-react for icons (if needed)
npm install lucide-react --workspace=@norchain/explorer
```

### 2. Build Packages

```bash
# Build design system
cd packages/design-system && npm run build

# Build SDK
cd packages/sdk && npm run build
```

---

## 📦 Using the Design System

### Import Design Tokens

```typescript
import { colors, spacing, typography } from '@norchain/design-system'
```

### Use Utility Functions

```typescript
import { cn, formatAddress, formatCurrency } from '@norchain/design-system'

// Merge classes
const className = cn('base-class', condition && 'conditional-class')

// Format address
const short = formatAddress('0x1234567890abcdef1234567890abcdef12345678')

// Format currency
const formatted = formatCurrency(1234.5678, 'NOR', 4)
```

### Configure Tailwind

```typescript
// tailwind.config.ts
import { norchainDesignSystem } from '@norchain/design-system/tailwind.config'

export default {
  ...norchainDesignSystem,
  // Your app-specific config
}
```

---

## 🔧 Using the SDK

### Basic Usage

```typescript
import { createSDK } from '@norchain/sdk'

// Create SDK instance
const sdk = createSDK({
  apiUrl: 'http://localhost:4000',
  rpcUrl: 'https://rpc.norchain.org',
  chainId: 65001,
})

// Use SDK clients
const stats = await sdk.api.getStats()
const balance = await sdk.wallet.getBalance('0x...')
const block = await sdk.explorer.getBlock(12345)
const quote = await sdk.exchange.getSwapQuote('NOR', 'USDT', '100')
```

### Individual Clients

```typescript
import { ApiClient, WalletClient, ExplorerClient, ExchangeClient } from '@norchain/sdk'

const api = new ApiClient({ apiUrl: 'http://localhost:4000' })
const wallet = new WalletClient({ apiUrl: 'http://localhost:4000' })
```

---

## 🎨 Using Interactive Components

### Explorer Components

```typescript
import {
  InteractiveBlockVisualization,
  TransactionFlowDiagram,
  NetworkActivityPulse,
  LiveTransactionFeed,
} from '@/components/interactive'

// Block Visualization
<InteractiveBlockVisualization
  blocks={blocks}
  onBlockClick={(block) => router.push(`/blocks/${block.height}`)}
/>

// Transaction Flow
<TransactionFlowDiagram
  from="0x1234..."
  to="0x5678..."
  value="100"
  status="confirmed"
/>

// Network Activity
<NetworkActivityPulse
  activity="high"
  transactionsPerSecond={10.5}
/>

// Live Feed
<LiveTransactionFeed
  transactions={transactions}
  maxItems={10}
/>
```

### Landing Components

```typescript
import {
  AnimatedStatsGrid,
  InteractiveRoadmap,
  LiveNetworkActivity,
} from '@/components/interactive'

// Animated Stats
<AnimatedStatsGrid
  stats={[
    { label: 'Total Transactions', value: 1234567 },
    { label: 'Total Blocks', value: 98765 },
    { label: 'Active Wallets', value: 54321 },
    { label: 'Total Value', value: 1000000, format: 'currency' },
  ]}
/>

// Roadmap
<InteractiveRoadmap
  items={[
    {
      quarter: 'Q1 2024',
      title: 'Foundation',
      description: 'Build core infrastructure',
      status: 'completed',
      features: ['API', 'Explorer', 'Wallet'],
    },
    // ...
  ]}
/>

// Network Activity
<LiveNetworkActivity
  transactionsPerSecond={10.5}
  blocksPerMinute={2.3}
  activeValidators={25}
/>
```

### Exchange Components

```typescript
import { PriceChart } from '@/components/interactive'

<PriceChart
  symbol="NOR/USDT"
  data={priceData}
  height={300}
/>
```

---

## 📝 Example Integration

### Explorer Homepage

```typescript
'use client'

import { InteractiveBlockVisualization } from '@/components/interactive'
import { LiveTransactionFeed } from '@/components/interactive'
import { NetworkActivityPulse } from '@/components/interactive'

export default function ExplorerHome() {
  const blocks = [
    { height: 12345, hash: '0x...', timestamp: Date.now() / 1000, transactions: 5, validator: '0x...' },
    // ...
  ]

  const transactions = [
    { hash: '0x...', from: '0x...', to: '0x...', value: '100', timestamp: Date.now() / 1000, status: 'confirmed' },
    // ...
  ]

  return (
    <div className="space-y-8">
      <NetworkActivityPulse activity="high" transactionsPerSecond={10.5} />
      
      <InteractiveBlockVisualization
        blocks={blocks}
        onBlockClick={(block) => router.push(`/blocks/${block.height}`)}
      />
      
      <LiveTransactionFeed transactions={transactions} />
    </div>
  )
}
```

### Landing Page

```typescript
'use client'

import { AnimatedStatsGrid } from '@/components/interactive'
import { LiveNetworkActivity } from '@/components/interactive'

export default function LandingPage() {
  return (
    <div>
      <AnimatedStatsGrid
        stats={[
          { label: 'Transactions', value: 1234567 },
          { label: 'Blocks', value: 98765 },
          { label: 'Wallets', value: 54321 },
          { label: 'Value Locked', value: 1000000, format: 'currency' },
        ]}
      />
      
      <LiveNetworkActivity
        transactionsPerSecond={10.5}
        blocksPerMinute={2.3}
        activeValidators={25}
      />
    </div>
  )
}
```

---

## 🎯 Next Steps

1. **Install dependencies** (framer-motion, lucide-react)
2. **Import components** into your pages
3. **Connect to real data** from API
4. **Customize styling** using design system
5. **Add more interactions** as needed

---

## 📚 Documentation

- [Design System README](../../packages/design-system/README.md)
- [SDK README](../../packages/sdk/README.md)
- [Enhancement Plan](./ECOSYSTEM_ENHANCEMENT_PLAN.md)
- [Enhancement Status](./ECOSYSTEM_ENHANCEMENT_STATUS.md)

---

**Happy Building!** 🚀

