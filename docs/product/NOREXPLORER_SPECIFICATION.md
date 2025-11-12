# NorExplorer - World-Class Blockchain Explorer Specification

**Date**: January 2025  
**Competitors**: BscScan, Etherscan, PolygonScan, TronScan  
**Purpose**: Public blockchain explorer and analytics dashboard — purely for transparency and developer insight

---

## 🎯 Core Mission

**NorExplorer** is a **dedicated blockchain explorer** focused on:
- ✅ **Visibility** - Complete transparency of blockchain data
- ✅ **Verification** - Contract source code verification
- ✅ **Analytics** - Network health and performance metrics
- ✅ **Developer Tools** - API access and developer resources
- ✅ **AI Enhancement** - AI-powered insights for explorer data only

**NOT**:
- ❌ Payment processing
- ❌ Trading/DEX functionality
- ❌ Staking interfaces
- ❌ Governance voting
- ❌ Wallet management

---

## 📋 Core Features

### 1. Blocks Explorer
- ✅ **Block List** - Paginated list with height, hash, timestamp, transactions count, validator
- ✅ **Block Details** - Full block header, transactions list, gas used/limit, block rewards
- ✅ **Block Analytics** - Gas usage trends, block time trends, validator distribution
- ✅ **Search** - By height or hash

### 2. Transactions Explorer
- ✅ **Transaction List** - Paginated with hash, from/to, value, gas, status, timestamp
- ✅ **Transaction Details** - Full transaction data, receipt, logs, events, internal transactions
- ✅ **Transaction Analytics** - Gas price trends, transaction volume, success rate
- ✅ **Advanced Filtering** - By address, block range, date range, value range, status
- ✅ **Search** - By transaction hash

### 3. Accounts/Addresses Explorer
- ✅ **Address Details** - Balance (native + tokens), transaction count, first/last transaction
- ✅ **Address Transactions** - Sent, received, internal, token transfers, contract interactions
- ✅ **Token Holdings** - List of tokens held with balances
- ✅ **Address Analytics** - Balance history, transaction volume, activity timeline
- ✅ **Risk Score** - AI-powered risk assessment (suspicious activity detection)
- ✅ **Search** - By address

### 4. Tokens Explorer
- ✅ **Token List** - All tokens with name, symbol, supply, holders count, price (from NEX API)
- ✅ **Token Details** - Full metadata, logo, supply, holders, transfers, price history
- ✅ **Token Holders** - Top holders list, holder distribution, holder search
- ✅ **Token Transfers** - Transfer history with filtering and export
- ✅ **Token Analytics** - Transfer volume, unique holders, price trends
- ✅ **Search** - By symbol, name, or contract address

### 5. Contracts Explorer
- ✅ **Contract List** - Verified contracts with name, address, compiler version
- ✅ **Contract Details** - Source code, ABI, constructor arguments, creation transaction
- ✅ **Contract Verification** - Multi-file verification, library linking, constructor args encoding
- ✅ **Contract Events** - Event logs with filtering and search
- ✅ **Contract Analytics** - Interactions count, balance history, token holdings
- ✅ **Contract Interaction** - Read functions (view-only), ABI viewer
- ✅ **Search** - By contract name or address

### 6. Network Analytics & Health
- ✅ **Network Stats Dashboard** - Total blocks, transactions, accounts, contracts, tokens
- ✅ **Gas Analytics** - Current gas price, gas price trends, gas usage by block
- ✅ **Network Health** - Block time, block size, transaction throughput
- ✅ **Node Dashboard** - Active nodes, validator status, network distribution
- ✅ **Charts & Graphs** - Transaction volume, active addresses, network growth

### 7. Developer Tools
- ✅ **Public API** - REST API for all explorer data
- ✅ **API Key Registration** - Free tier with rate limits, registration portal
- ✅ **API Documentation** - Complete API docs with examples
- ✅ **GraphQL API** - Alternative query interface
- ✅ **WebSocket** - Real-time updates for blocks/transactions
- ✅ **Export Tools** - CSV/JSON export for transactions, transfers, events

### 8. AI-Enhanced Explorer Features
- ✅ **Transaction Analysis** - AI-powered transaction explanation and risk assessment
- ✅ **Contract Analysis** - AI-powered contract security audit and code review
- ✅ **Address Risk Score** - AI-powered suspicious activity detection
- ✅ **Gas Optimization** - AI suggestions for gas optimization
- ✅ **Smart Contract Insights** - AI-generated contract summaries and documentation
- ✅ **Anomaly Detection** - AI detection of unusual patterns in transactions/blocks

---

## 🗂️ Page Structure

### Core Pages (Keep)
```
apps/explorer/app/
├── page.tsx                    # Homepage (stats, latest blocks/txs)
├── blocks/
│   ├── page.tsx               # Blocks list
│   └── [height]/
│       └── page.tsx           # Block details
├── transactions/
│   ├── page.tsx               # Transactions list
│   └── [hash]/
│       └── page.tsx           # Transaction details
├── accounts/
│   ├── page.tsx               # Accounts list (optional)
│   └── [address]/
│       ├── page.tsx           # Address overview
│       ├── transactions/      # Address transactions
│       └── tokens/            # Address token holdings
├── tokens/
│   ├── page.tsx               # Tokens list
│   └── [address]/
│       ├── page.tsx           # Token overview
│       ├── holders/           # Token holders
│       └── transfers/        # Token transfers
├── contracts/
│   ├── page.tsx               # Contracts list (verified)
│   └── [address]/
│       ├── page.tsx           # Contract overview
│       ├── code/               # Source code viewer
│       ├── abi/                # ABI viewer
│       ├── events/             # Contract events
│       └── verify/             # Contract verification
├── validators/
│   ├── page.tsx               # Validators list
│   └── [address]/
│       └── page.tsx           # Validator details
├── analytics/
│   └── page.tsx               # Network analytics dashboard
└── api/
    └── page.tsx               # API documentation & key registration
```

### Pages to Remove/Move
- ❌ `/dex` → Move to NEX Exchange
- ❌ `/swap` → Move to NEX Exchange
- ❌ `/staking` → Move to Staking Dashboard
- ❌ `/governance` → Move to Governance Portal
- ❌ `/bridge` → Move to Bridge App
- ❌ `/arbitrage` → Remove or move to Trading Tools
- ❌ `/mixer` → Remove or move to Privacy Tools
- ❌ `/flashcoins` → Remove or move to Trading Tools
- ❌ `/crowdfunding` → Move to Launchpad App
- ❌ `/charity` → Move to Charity Portal
- ❌ `/enterprise` → Move to Enterprise Portal
- ❌ `/buy` → Move to Wallet/Onboarding
- ❌ `/wallet` → Move to Wallet App
- ❌ `/wallet-setup` → Move to Wallet App
- ❌ `/ai-decoder` → Keep but rename to `/tools/transaction-decoder` (explorer tool)
- ❌ `/protocol-contracts` → Keep as part of contracts explorer (verified contracts section)

---

## 🎨 UI/UX Principles

### Design Philosophy
- **Minimal UI** - Clean, uncluttered interface
- **Maximum Performance** - Fast page loads, optimized queries
- **Developer-Focused** - Technical details readily available
- **Mobile-Responsive** - Works perfectly on all devices

### Design Guidelines
- **Color Scheme** - Professional blue/gray theme (like Etherscan)
- **Typography** - Monospace fonts for addresses/hashes, sans-serif for UI
- **Layout** - Single-column for details, tables for lists
- **Navigation** - Simple top nav, breadcrumbs for deep pages
- **Search** - Prominent search bar, universal search (address/tx/block)

### Performance Targets
- **Page Load** - < 2 seconds
- **Search Response** - < 500ms
- **API Response** - < 200ms (p95)
- **Real-time Updates** - < 1 second latency

---

## 🔧 Technical Requirements

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state
- **Real-time**: WebSocket for live updates
- **Charts**: Recharts or similar

### Backend Integration
- **API Base**: `http://api.norchain.org/api/v1` (or localhost in dev)
- **Endpoints**: Use Explorer API endpoints we just created
- **Authentication**: API keys for developer access
- **Rate Limiting**: Per API key tier

### AI Integration
- **Transaction Analysis**: AI service for explaining transactions
- **Contract Analysis**: AI service for security audits
- **Risk Scoring**: AI service for address risk assessment
- **All AI features** must be explorer-related only

---

## 📊 Feature Comparison (vs Competitors)

### Must-Have Features (Etherscan/BSCscan Level)
| Feature | Etherscan | BSCscan | NorExplorer |
|---------|-----------|---------|-------------|
| Block Explorer | ✅ | ✅ | ✅ |
| Transaction Explorer | ✅ | ✅ | ✅ |
| Address Explorer | ✅ | ✅ | ✅ |
| Token Explorer | ✅ | ✅ | ✅ |
| Contract Verification | ✅ | ✅ | ✅ |
| Contract Interaction | ✅ | ✅ | ✅ |
| API Access | ✅ | ✅ | ✅ |
| Export Data | ✅ | ✅ | ✅ |
| Mobile Responsive | ✅ | ✅ | ✅ |

### Competitive Advantages
- ✅ **AI-Powered Insights** - Transaction/contract analysis
- ✅ **Better Performance** - Faster load times
- ✅ **Modern UI** - Cleaner, more intuitive
- ✅ **Free API** - More generous free tier
- ✅ **Real-time Updates** - WebSocket support

---

## 🚀 Implementation Roadmap

### Phase 1: Cleanup & Core (Week 1-2)
1. ✅ Remove non-explorer pages (DEX, staking, governance, etc.)
2. ✅ Update navigation to focus on explorer features
3. ✅ Enhance existing blocks/transactions/accounts pages
4. ✅ Implement contract verification UI
5. ✅ Implement token explorer

### Phase 2: Advanced Features (Week 3-4)
1. ✅ Advanced filtering and search
2. ✅ Export functionality
3. ✅ Analytics dashboard
4. ✅ Network health monitoring
5. ✅ API documentation portal

### Phase 3: AI Integration (Week 5-6)
1. ✅ Transaction analysis AI
2. ✅ Contract analysis AI
3. ✅ Address risk scoring
4. ✅ Gas optimization suggestions
5. ✅ Anomaly detection

### Phase 4: Polish & Performance (Week 7-8)
1. ✅ Performance optimization
2. ✅ Mobile responsiveness
3. ✅ UI/UX polish
4. ✅ Testing & bug fixes
5. ✅ Documentation

---

## 📝 API Endpoints Needed

### Already Implemented ✅
- `GET /api/v1/stats` - Network statistics
- `GET /api/v1/blocks` - List blocks
- `GET /api/v1/blocks/:height` - Block details
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/transactions/:hash` - Transaction details
- `GET /api/v1/accounts/:address` - Account details
- `GET /api/v1/contracts/:address` - Contract details
- `GET /api/v1/contracts/:address/abi` - Contract ABI
- `GET /api/v1/contracts/:address/source` - Contract source
- `GET /api/v1/tokens` - List tokens
- `GET /api/v1/tokens/:address` - Token details

### Need to Implement
- `POST /api/v1/contracts/:address/verify` - Contract verification (integrate with existing endpoint)
- `GET /api/v1/contracts/:address/events` - Contract events (with filtering)
- `GET /api/v1/tokens/:address/holders` - Token holders (with pagination)
- `GET /api/v1/tokens/:address/transfers` - Token transfers (with filtering)
- `GET /api/v1/accounts/:address/tokens` - Address token holdings
- `GET /api/v1/accounts/:address/internal-transactions` - Internal transactions
- `GET /api/v1/analytics/gas` - Gas analytics
- `GET /api/v1/analytics/network` - Network analytics
- `POST /api/v1/api-keys/register` - Register API key
- `GET /api/v1/api-keys` - List user's API keys

---

## 🎯 Success Metrics

### Performance Metrics
- Page load time < 2s
- Search response < 500ms
- API response < 200ms (p95)
- Mobile performance score > 90

### User Experience Metrics
- Bounce rate < 30%
- Average session duration > 5 minutes
- Pages per session > 5
- Search success rate > 80%

### Developer Metrics
- API key registrations > 100/month
- API requests > 1M/month
- Contract verifications > 50/month

---

## 🔐 API Key System

### Free Tier
- **Rate Limit**: 5 requests/second
- **Daily Limit**: 100,000 requests/day
- **Features**: All explorer endpoints
- **Registration**: Simple email-based registration

### Premium Tier (Future)
- **Rate Limit**: 50 requests/second
- **Daily Limit**: 10M requests/day
- **Features**: Priority support, webhooks, advanced analytics
- **Pricing**: TBD

---

## 📚 Documentation Requirements

### User Documentation
- Getting started guide
- Search guide
- Contract verification guide
- API documentation
- FAQ

### Developer Documentation
- API reference
- Code examples
- Rate limits
- Authentication guide
- Webhook setup

---

**Status**: 📋 **SPECIFICATION COMPLETE**

This specification defines NorExplorer as a world-class blockchain explorer focused purely on transparency, verification, and developer insight.

