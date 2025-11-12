# Component Integration Guide
## Integrating Interactive Components into Pages

---

## Prerequisites

### Install Dependencies

```bash
# From root directory
cd apps/explorer && npm install framer-motion lucide-react
cd ../landing && npm install framer-motion
cd ../nex-exchange && npm install framer-motion
```

Or manually add to `package.json`:

```json
{
  "dependencies": {
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0"
  }
}
```

---

## Explorer Integration

### 1. Add Interactive Block Visualization

**File**: `apps/explorer/app/page.tsx`

```typescript
'use client'

import { InteractiveBlockVisualization } from '@/components/interactive'
import { NetworkActivityPulse } from '@/components/interactive'
import { LiveTransactionFeed } from '@/components/interactive'

// In your component:
<NetworkActivityPulse 
  activity="high" 
  transactionsPerSecond={10.5} 
/>

<InteractiveBlockVisualization
  blocks={blocks.map(b => ({
    height: b.height,
    hash: b.hash,
    timestamp: b.timestamp,
    transactions: b.transactions,
    validator: b.validator,
  }))}
  onBlockClick={(block) => router.push(`/blocks/${block.height}`)}
/>

<LiveTransactionFeed
  transactions={transactions.map(tx => ({
    hash: tx.hash,
    from: tx.fromAddress,
    to: tx.toAddress,
    value: weiToXhn(tx.value),
    timestamp: tx.timestamp,
    status: 'confirmed',
  }))}
  maxItems={10}
/>
```

### 2. Add Transaction Flow Diagram

**File**: `apps/explorer/app/tx/[hash]/page.tsx`

```typescript
import { TransactionFlowDiagram } from '@/components/interactive'

<TransactionFlowDiagram
  from={transaction.fromAddress}
  to={transaction.toAddress}
  value={weiToXhn(transaction.value)}
  gasUsed={transaction.gasUsed}
  status="confirmed"
/>
```

---

## Landing Page Integration

### 1. Replace NetworkStats with AnimatedStatsGrid

**File**: `apps/landing/components/NetworkStats.tsx`

```typescript
'use client'

import { AnimatedStatsGrid } from '@/components/interactive'

export default function NetworkStats() {
  const [stats, setStats] = useState({
    currentBlock: 7542,
    totalTx: 45283,
    activeWallets: 1247,
    dexVolume: 24582,
    charityDonated: 3247,
  })

  useEffect(() => {
    // Fetch stats from API
    // Update stats state
  }, [])

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Nor Network Status
        </h2>
        
        <AnimatedStatsGrid
          stats={[
            { label: 'Current Block', value: stats.currentBlock },
            { label: 'Total Transactions', value: stats.totalTx },
            { label: 'Active Wallets', value: stats.activeWallets },
            { label: 'DEX Volume (24h)', value: stats.dexVolume, prefix: '$' },
            { label: 'Charity Donated', value: stats.charityDonated, prefix: '$', format: 'currency' },
            { label: 'Network Status', value: 'Online', suffix: '' },
          ]}
        />
      </div>
    </section>
  )
}
```

### 2. Replace Roadmap with InteractiveRoadmap

**File**: `apps/landing/components/Roadmap.tsx`

```typescript
'use client'

import { InteractiveRoadmap } from '@/components/interactive'

export default function Roadmap() {
  const roadmapItems = [
    {
      quarter: 'Q4 2024',
      title: 'Foundation',
      description: 'Core infrastructure and mainnet launch',
      status: 'completed' as const,
      features: [
        'Mainnet launch',
        'Block explorer',
        'Bridge to Ethereum',
        'NorSwap DEX',
      ],
    },
    // ... more items
  ]

  return (
    <section id="roadmap" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Roadmap
        </h2>
        
        <InteractiveRoadmap items={roadmapItems} />
      </div>
    </section>
  )
}
```

### 3. Add Live Network Activity

**File**: `apps/landing/components/Hero.tsx` or create new section

```typescript
import { LiveNetworkActivity } from '@/components/interactive'

<LiveNetworkActivity
  transactionsPerSecond={10.5}
  blocksPerMinute={2.3}
  activeValidators={25}
/>
```

---

## NEX Exchange Integration

### 1. Add Price Chart

**File**: `apps/nex-exchange/src/pages/swap.tsx` or similar

```typescript
'use client'

import { PriceChart } from '@/components/interactive'

// Mock price data - replace with real API data
const priceData = [
  { timestamp: Date.now() - 3600000, price: 0.0001 },
  { timestamp: Date.now() - 1800000, price: 0.00015 },
  { timestamp: Date.now(), price: 0.0002 },
]

<PriceChart
  symbol="NOR/USDT"
  data={priceData}
  height={300}
/>
```

---

## Step-by-Step Integration

### Step 1: Install Dependencies

```bash
# Check if framer-motion is installed
npm list framer-motion

# If not, install it
npm install framer-motion
```

### Step 2: Import Components

```typescript
// Single import
import { InteractiveBlockVisualization } from '@/components/interactive'

// Or multiple imports
import {
  InteractiveBlockVisualization,
  NetworkActivityPulse,
  LiveTransactionFeed,
} from '@/components/interactive'
```

### Step 3: Convert to Client Component

If your page is a server component, convert it to a client component:

```typescript
'use client' // Add this at the top
```

### Step 4: Add Component to JSX

Replace static components with interactive ones:

```typescript
// Before
<div className="blocks-list">
  {blocks.map(block => <BlockCard key={block.id} block={block} />)}
</div>

// After
<InteractiveBlockVisualization
  blocks={blocks}
  onBlockClick={(block) => router.push(`/blocks/${block.height}`)}
/>
```

### Step 5: Connect to Real Data

Update component props with real API data:

```typescript
const { data: blocks } = useQuery({
  queryKey: ['blocks'],
  queryFn: () => apiClient.getBlocks({ page: 1, per_page: 10 }),
})

<InteractiveBlockVisualization blocks={blocks?.data || []} />
```

---

## Common Issues & Solutions

### Issue: "framer-motion not found"

**Solution**: Install framer-motion
```bash
npm install framer-motion
```

### Issue: "Cannot use client component in server component"

**Solution**: Add `'use client'` directive at the top of the file

### Issue: Components not animating

**Solution**: 
1. Check if framer-motion is installed
2. Ensure component is a client component
3. Check browser console for errors

### Issue: Type errors

**Solution**: Ensure TypeScript types are correct:
```typescript
interface Block {
  height: number
  hash: string
  timestamp: number
  transactions: number
  validator: string
}
```

---

## Best Practices

1. **Gradual Integration**: Start with one component, test, then add more
2. **Data Fetching**: Use React Query or SWR for data fetching
3. **Error Handling**: Wrap components in error boundaries
4. **Performance**: Use React.memo for expensive components
5. **Accessibility**: Ensure animations don't interfere with accessibility

---

## Examples

See the component files for complete examples:
- `apps/explorer/components/interactive/InteractiveBlockVisualization.tsx`
- `apps/landing/components/interactive/AnimatedStats.tsx`
- `apps/nex-exchange/components/interactive/PriceChart.tsx`

---

**Last Updated**: November 2024

