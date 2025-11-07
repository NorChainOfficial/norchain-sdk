# Xaheen Chain - Block Explorer Frontend

**Next.js 14 Block Explorer UI for Xaheen Chain**

A modern, high-performance blockchain explorer built with Next.js 14, TypeScript, React Query, and Tailwind CSS. Features real-time data updates, 26-decimal XAHEEN token precision, and a responsive dark mode interface.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Pages & Components](#pages--components)
- [API Integration](#api-integration)
- [26-Decimal Precision](#26-decimal-precision)
- [Wallet Integration](#wallet-integration)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Xaheen Chain Block Explorer frontend provides a user-friendly interface for exploring blockchain data:

- **Real-time updates**: Automatic data refresh every 5 seconds using TanStack Query
- **26-decimal precision**: Full support for XAHEEN token amounts with BigInt
- **Responsive design**: Works seamlessly on desktop, tablet, and mobile
- **Dark mode**: Beautiful dark theme for reduced eye strain
- **Type-safe**: Complete TypeScript implementation with strict mode
- **Modern UX**: Clean, intuitive interface with loading states and error handling

**Live URL**: http://localhost:3002

**Backend API**: http://localhost:8000/api/v1

---

## Features

### Core Functionality

- ✅ **Dashboard**: Real-time blockchain statistics and latest blocks
- ✅ **Blocks Explorer**: Browse and search blockchain blocks
- ✅ **Transactions**: View all transactions with detailed information
- ✅ **Accounts**: Explore account balances and activity
- ✅ **Validators**: Monitor network validators and voting power
- ✅ **Flash Coins**: Test token generation and management
- ✅ **Wallet Integration**: Automatic wallet setup for BitcoinBR and Flash Coins
- ✅ **Real-time Updates**: Auto-refresh data every 5 seconds
- ✅ **Copy to Clipboard**: One-click copy for addresses and hashes
- ✅ **Responsive Design**: Mobile-first, works on all devices
- ✅ **Dark Mode**: Eye-friendly dark theme

### UI Components

Production-ready components include:

- **Button**: Primary, secondary, outline variants
- **Card**: Content containers with hover effects
- **Badge**: Status indicators (success, warning, error)
- **Skeleton**: Loading placeholders for better UX
- **CopyButton**: Copy text with visual feedback
- **Table**: Data tables with pagination
- **Stats Cards**: Dashboard metrics display
- **Wallet Connector**: Automatic wallet setup component

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5+ (strict mode)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.3
- **Data Fetching**: TanStack Query (React Query) 5.0
- **HTTP Client**: Fetch API (native)
- **Icons**: Lucide React (optional)
- **Package Manager**: npm

**Key Dependencies**:
```json
{
  "next": "14.2.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "@tanstack/react-query": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "typescript": "^5"
}
```

---

## Installation

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Laravel API**: Running on http://localhost:8000

### Step 1: Install Dependencies

```bash
cd /Volumes/Development/sahalat/blockchain/xaheen-explorer

# Install all dependencies
npm install
```

### Step 2: Environment Configuration

Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=false
```

**Important**: All environment variables that need to be accessible in the browser must be prefixed with `NEXT_PUBLIC_`.

### Step 3: Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3002**

---

## Configuration

### API Configuration

The API client is configured in `src/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = {
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json();
  },

  async getBlocks(page = 1, perPage = 20) {
    const response = await fetch(`${API_BASE_URL}/blocks?page=${page}&per_page=${perPage}`);
    return response.json();
  },

  // ... more endpoints
};
```

### TanStack Query Configuration

React Query is configured in `src/app/providers.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,        // Refresh every 5 seconds
        refetchInterval: 5000,  // Auto-refetch interval
        retry: 3,               // Retry failed requests
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Tailwind Configuration

Tailwind is configured in `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    // Blue
        secondary: '#8B5CF6',  // Purple
        success: '#10B981',    // Green
        warning: '#F59E0B',    // Orange
        error: '#EF4444',      // Red
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
```

---

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Project Structure

```
xaheen-explorer/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard (homepage)
│   │   ├── blocks/
│   │   │   ├── page.tsx       # Blocks list
│   │   │   └── [id]/page.tsx  # Block details
│   │   ├── transactions/
│   │   │   └── page.tsx       # Transactions list
│   │   ├── accounts/
│   │   │   └── page.tsx       # Accounts list
│   │   ├── validators/
│   │   │   └── page.tsx       # Validators list
│   │   ├── flashcoins/
│   │   │   └── page.tsx       # Flash Coins information
│   │   └── wallet-setup/
│   │       └── page.tsx       # Wallet setup page
│   ├── components/            # React components
│   │   ├── ui/                # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── CopyButton.tsx
│   │   ├── wallet/            # Wallet integration components
│   │   │   └── WalletConnector.tsx
│   │   └── layout/            # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Navigation.tsx
│   ├── lib/                   # Utilities
│   │   ├── api.ts             # API client
│   │   ├── formatXAHEEN.ts     # 26-decimal formatter
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript types
│       └── index.ts           # Type definitions
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

### Adding New Pages

Create a new page in the `app` directory:

```typescript
// src/app/my-page/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function MyPage(): JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData'],
    queryFn: api.getMyData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Page</h1>
      {/* Your content */}
    </div>
  );
}
```

---

## Pages & Components

### Dashboard (Homepage)

**File**: `src/app/page.tsx`

Displays:
- Real-time blockchain statistics
- Latest blocks
- Quick navigation cards
- **Wallet Connector** for automatic setup

### Blocks Page

**File**: `src/app/blocks/page.tsx`

Features:
- Paginated block list
- Search by height or hash
- Real-time updates

### Transactions Page

**File**: `src/app/transactions/page.tsx`

Features:
- Transaction list with pagination
- Filter by status, sender, receiver
- 26-decimal amount display

### Accounts Page

**File**: `src/app/accounts/page.tsx`

Features:
- Account list with balances
- Search by address
- Transaction count

### Validators Page

**File**: `src/app/validators/page.tsx`

Features:
- Active validators list
- Voting power display
- Status indicators

### Flash Coins Page

**File**: `src/app/flashcoins/page.tsx`

Features:
- Information about Flash Coins
- **Wallet Connector** for automatic token setup
- Token details and usage instructions

### Wallet Setup Page

**File**: `src/app/wallet-setup/page.tsx`

Features:
- **Wallet Connector** component
- Setup instructions
- Supported wallets information
- Manual configuration details

---

## API Integration

### API Client

**File**: `src/lib/api.ts`

Complete API client with TypeScript types:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface StatsResponse {
  blocks: number;
  transactions: number;
  accounts: number;
  validators: number;
  latest_block: {
    height: number;
    hash: string;
    timestamp: string;
  };
}

interface Block {
  id: number;
  height: number;
  hash: string;
  previous_hash: string;
  timestamp: string;
  proposer_address: string;
  transaction_count: number;
  gas_used: number;
  gas_wanted: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
  };
}

export const api = {
  async getStats(): Promise<StatsResponse> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async getBlocks(page = 1, perPage = 20): Promise<PaginatedResponse<Block>> {
    const response = await fetch(`${API_BASE_URL}/blocks?page=${page}&per_page=${perPage}`);
    if (!response.ok) throw new Error('Failed to fetch blocks');
    return response.json();
  },

  async getBlock(heightOrHash: string | number): Promise<Block> {
    const endpoint = typeof heightOrHash === 'number'
      ? `${API_BASE_URL}/blocks/${heightOrHash}`
      : `${API_BASE_URL}/blocks/hash/${heightOrHash}`;

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Block not found');
    return response.json();
  },

  // ... more methods
};
```

### Using React Query

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function BlocksList(): JSX.Element {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['blocks', page],
    queryFn: () => api.getBlocks(page, 20),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) return <Skeleton />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.data.map(block => (
        <BlockCard key={block.id} block={block} />
      ))}

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(data.meta.total / data.meta.per_page)}
        onPageChange={setPage}
      />
    </div>
  );
}
```

---

## 26-Decimal Precision

### formatXAHEEN Utility

**File**: `src/lib/formatXAHEEN.ts`

Handles 26-decimal XAHEEN token amounts using BigInt:

```typescript
/**
 * Format XAHEEN amount with 26-decimal precision
 * @param amount - Amount as string (e.g., "1000.00000000000000000000000000")
 * @param decimals - Number of decimals to display (default: 6)
 * @returns Formatted string (e.g., "1,000.000000 XAHEEN")
 */
export function formatXAHEEN(amount: string | number, decimals: number = 6): string {
  if (!amount) return '0 XAHEEN';

  try {
    // Convert to string if number
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;

    // Split into integer and decimal parts
    const [integerPart, decimalPart = ''] = amountStr.split('.');

    // Format integer part with thousands separators
    const formattedInteger = parseInt(integerPart).toLocaleString('en-US');

    // Take only specified decimal places
    const formattedDecimals = decimalPart.padEnd(decimals, '0').slice(0, decimals);

    return `${formattedInteger}.${formattedDecimals} XAHEEN`;
  } catch (error) {
    console.error('Error formatting XAHEEN amount:', error);
    return '0 XAHEEN';
  }
}

/**
 * Convert base units to XAHEEN (26 decimals)
 * @param baseUnits - Amount in base units (string to handle large numbers)
 * @returns XAHEEN amount as string
 */
export function baseUnitsTobtCBR(baseUnits: string): string {
  try {
    const bigIntValue = BigInt(baseUnits);
    const divisor = BigInt(10) ** BigInt(26);

    const integerPart = bigIntValue / divisor;
    const remainder = bigIntValue % divisor;

    // Pad remainder to 26 digits
    const decimalPart = remainder.toString().padStart(26, '0');

    return `${integerPart}.${decimalPart}`;
  } catch (error) {
    console.error('Error converting base units:', error);
    return '0';
  }
}

/**
 * Convert XAHEEN to base units (26 decimals)
 * @param btcbr - XAHEEN amount as string
 * @returns Base units as string
 */
export function btcbrToBaseUnits(btcbr: string): string {
  try {
    const [integerPart = '0', decimalPart = ''] = btcbr.split('.');

    // Pad or trim decimal to 26 digits
    const paddedDecimals = decimalPart.padEnd(26, '0').slice(0, 26);

    // Combine and convert to BigInt
    const baseUnits = BigInt(integerPart + paddedDecimals);

    return baseUnits.toString();
  } catch (error) {
    console.error('Error converting to base units:', error);
    return '0';
  }
}
```

### Usage Examples

```typescript
import { formatXAHEEN, baseUnitsTobtCBR } from '@/lib/formatXAHEEN';

// Format amount from API
const amount = "1500.00000000000000000000000000";
console.log(formatXAHEEN(amount));
// Output: "1,500.000000 XAHEEN"

// Convert base units to XAHEEN
const baseUnits = "1500000000000000000000000000";
const btcbr = baseUnitsTobtCBR(baseUnits);
console.log(formatXAHEEN(btcbr));
// Output: "1,500.000000 XAHEEN"

// Display with more decimals
console.log(formatXAHEEN(amount, 12));
// Output: "1,500.000000000000 XAHEEN"
```

---

## Wallet Integration

### Features

The Xaheen Explorer includes seamless wallet integration for BitcoinBR and Flash Coin tokens:

1. **Automatic Wallet Detection** - Detects MetaMask, Trust Wallet, and other EIP-1193 compliant wallets
2. **One-Click Network Addition** - Adds Xaheen Chain network with a single click
3. **Automatic Token Detection** - Adds BitcoinBR and Flash Coin tokens to supported wallets
4. **Connection Status** - Shows connected account and network information

### WalletConnector Component

**File**: `src/components/wallet/WalletConnector.tsx`

The main component that provides all wallet integration functionality:

```typescript
import { WalletConnector } from '@/components/wallet/WalletConnector';

// Use the component in any page
<WalletConnector />
```

### Token List

The explorer provides a token list at `/tokenlist.json` that wallets can use for automatic token detection:

```json
{
  "name": "Xaheen Chain Token List",
  "tokens": [
    {
      "chainId": 885824,
      "address": "0x0cF8e180350253271f4b917CcFb0aCCc4862F262",
      "name": "BitcoinBR",
      "symbol": "BTCBR",
      "decimals": 18
    }
  ]
}
```

### API Endpoints

- **Wallet Configuration**: `/api/wallet-config`
- **Token List**: `/api/tokenlist`

### Supported Wallets

1. **MetaMask** - Full support for all features
2. **Trust Wallet** - Supported via browser extension
3. **Ledger** - Supported via MetaMask bridge
4. **Other EIP-1193 compliant wallets** - Basic support

---

## Building for Production

### Build Commands

```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Build Output

Next.js will create an optimized production build in the `.next` directory.

### Environment Variables

For production, set environment variables in your hosting platform:

```env
NEXT_PUBLIC_API_URL=https://api.bitcoinbr.com/api/v1
```

### Optimization

The production build includes:

- **Code splitting**: Automatic route-based code splitting
- **Minification**: JavaScript and CSS minification
- **Image optimization**: Automatic image optimization
- **Static generation**: Pre-rendered pages where possible
- **Caching**: Aggressive caching for static assets

### Deployment Options

**Vercel** (Recommended):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Docker**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

EXPOSE 3002
CMD ["npm", "start"]
```

**Nginx Reverse Proxy**:
```nginx
server {
    listen 80;
    server_name explorer.bitcoinbr.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### Common Issues

**1. API Connection Failed**

```bash
# Check API is running
curl http://localhost:8000/api/v1/stats

# Verify environment variable
cat .env.local | grep NEXT_PUBLIC_API_URL

# Check for CORS errors in browser console
# Ensure Laravel API has CORS enabled for http://localhost:3002
```

**2. Build Errors**

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

**3. Real-time Updates Not Working**

```bash
# Verify React Query configuration in providers.tsx
# Check refetchInterval is set to 5000
# Ensure API is returning fresh data
```

**4. 26-Decimal Formatting Issues**

```bash
# Ensure amount is passed as string
formatXAHEEN("1000.00000000000000000000000000")

# Not as number (will lose precision)
formatXAHEEN(1000.0) // WRONG

# Check for JavaScript number precision limits
# Always use string for amounts from API
```

**5. Page Not Found (404)**

```bash
# Ensure development server is running
npm run dev

# Check file structure matches Next.js App Router conventions
# Files must be in src/app/ directory
# Page files must be named page.tsx
```

### Debugging

**Enable Debug Mode**:
```env
NEXT_PUBLIC_DEBUG=true
```

**Check Logs**:
```bash
# Development server logs
npm run dev

# Production server logs
npm run start

# Browser console
# Open DevTools -> Console
```

**React Query Devtools** (optional):
```bash
npm install @tanstack/react-query-devtools

# Add to providers.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## TypeScript Types

### Type Definitions

**File**: `src/types/index.ts`

```typescript
export interface Block {
  id: number;
  height: number;
  hash: string;
  previous_hash: string;
  timestamp: string;
  proposer_address: string;
  transaction_count: number;
  gas_used: number;
  gas_wanted: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  hash: string;
  block_height: number;
  timestamp: string;
  sender_address: string;
  receiver_address: string;
  amount: string; // 26-decimal precision as string
  fee: string;    // 26-decimal precision as string
  gas_used: number;
  gas_wanted: number;
  status: 'success' | 'failed' | 'pending';
  memo?: string;
}

export interface Account {
  address: string;
  balance: string; // 26-decimal precision as string
  transaction_count: number;
  first_seen_block: number;
  last_seen_block: number;
  created_at: string;
  updated_at: string;
}

export interface Validator {
  address: string;
  moniker: string;
  voting_power: number;
  commission_rate: string;
  status: 'active' | 'inactive' | 'jailed';
  uptime: number;
}

export interface Stats {
  blocks: number;
  transactions: number;
  accounts: number;
  validators: number;
  latest_block: {
    height: number;
    hash: string;
    timestamp: string;
    transaction_count: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page?: number;
  };
}
```

---

## License

This project is part of the Xaheen Chain ecosystem and is licensed under the MIT License.

---

## Support

For issues and questions:

- **GitHub Issues**: [Create an issue](https://github.com/bitcoinbr/blockchain/issues)
- **Documentation**: `/Volumes/Development/sahalat/blockchain/docs/`
- **API Documentation**: `/Volumes/Development/sahalat/blockchain/bitcoinbr-api/README.md`

---

## Related Projects

- **Xaheen Chain**: `/Volumes/Development/sahalat/blockchain/bitcoinbr/`
- **Block Explorer API**: `/Volumes/Development/sahalat/blockchain/bitcoinbr-api/`
- **FlashCoins Module**: `/Volumes/Development/sahalat/blockchain/bitcoinbr/x/flashcoins/`
- **BSC Bridge**: `/Volumes/Development/sahalat/blockchain/bitcoinbr/bridge-contracts/`

---

## Contributing

Contributions are welcome! Please ensure:

1. All code is TypeScript with strict mode
2. Components follow React functional component patterns
3. Use Tailwind CSS for styling (no inline styles)
4. Maintain 26-decimal precision for XAHEEN amounts
5. Add proper error handling and loading states
6. Write clear, descriptive commit messages

---

**Built with ❤️ for Xaheen Chain**