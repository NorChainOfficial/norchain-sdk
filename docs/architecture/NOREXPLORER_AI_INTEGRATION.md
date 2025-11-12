# NorExplorer AI Integration - Complete Implementation Guide

## 🎯 Overview

NorExplorer has been transformed into **NorExplorer++** - an AI-first blockchain explorer that doesn't just show data, but understands it, identifies risks, and provides actionable insights. This document outlines the complete AI integration across all Explorer pages.

## 🧠 Core AI Endpoints

All AI functionality is powered by the Unified API's `/api/v1/ai/*` endpoints:

1. **POST `/api/v1/ai/analyze-transaction`** - Transaction analysis and risk scoring
2. **POST `/api/v1/ai/audit-contract`** - Smart contract security audit
3. **GET `/api/v1/ai/predict-gas`** - Gas price prediction with trends
4. **GET `/api/v1/ai/detect-anomalies`** - Address anomaly detection
5. **POST `/api/v1/ai/optimize-portfolio`** - Portfolio optimization recommendations
6. **POST `/api/v1/ai/chat`** - Context-aware AI chat assistant

## 📁 Architecture

### React Hooks (`apps/explorer/hooks/useAI.ts`)

Custom hooks provide clean, reusable interfaces for all AI features:

- `useAnalyzeTransaction(txHash)` - Transaction analysis
- `useAuditContract(contractAddress)` - Contract security audit
- `usePredictGas()` - Gas price prediction (auto-refreshes every minute)
- `useDetectAnomalies(address, days)` - Anomaly detection
- `useOptimizePortfolio(address)` - Portfolio optimization
- `useNorAIChat()` - AI chat mutation hook

**Combined Hooks:**
- `useTransactionAI(txHash, fromAddress)` - Combines analysis + anomalies + gas
- `useAddressAI(address)` - Combines anomalies + portfolio optimization
- `useContractAI(contractAddress, abi)` - Combines audit + function explanation

### Components

#### 1. TransactionAI (`components/ai/TransactionAI.tsx`)
**Location**: Transaction detail page (`/transactions/[hash]`)

**Features:**
- ✅ Plain-language transaction summary
- ✅ Risk score (0-100) with color-coded badges
- ✅ Key insights and recommendations
- ✅ Anomaly detection banner for sender address
- ✅ Gas analysis with predictions

**UI Elements:**
- Risk meter with color coding (green/yellow/red)
- Expandable anomaly details
- Gas price comparison

#### 2. AddressAI (`components/ai/AddressAI.tsx`)
**Location**: Address detail page (`/accounts/[address]`)

**Features:**
- ✅ Address risk score (0-100) with visual meter
- ✅ 30-day anomaly detection summary
- ✅ Portfolio optimization recommendations
- ✅ Current vs optimized value comparison
- ✅ Actionable recommendations with impact levels

**UI Elements:**
- Risk score meter (visual progress bar)
- Portfolio value cards (current vs optimized)
- Expandable recommendations list
- Impact badges (high/medium/low)

#### 3. TokenSafety (`components/ai/TokenSafety.tsx`)
**Location**: Token detail pages (to be integrated)

**Features:**
- ✅ Token security audit (0-100 score)
- ✅ Vulnerability list with severity tags
- ✅ AI-generated token summary
- ✅ Risk assessment

**UI Elements:**
- Security score display
- Vulnerability cards (critical/high/medium/low)
- "Get AI Summary" button with loading state

#### 4. ContractFunctionExplainer (`components/ai/ContractFunctionExplainer.tsx`)
**Location**: Contract detail page (`/contracts/[address]`) - Code tab

**Features:**
- ✅ Function-by-function explanation
- ✅ Click to expand AI explanations
- ✅ State mutability indicators (view/pure/payable)
- ✅ Function signature display

**UI Elements:**
- Expandable function cards
- AI explanation panels
- Mutability badges

#### 5. AISidebar (`components/ai/AISidebar.tsx`)
**Location**: Global (all pages) - Floating button + sidebar

**Features:**
- ✅ Context-aware chat assistant
- ✅ Auto-detects current page type (transaction/address/token/contract/block)
- ✅ Suggests relevant questions
- ✅ Chat history with timestamps
- ✅ Loading states

**UI Elements:**
- Floating action button (bottom-right)
- Slide-out sidebar (384px width)
- Message bubbles (user/assistant)
- Suggested questions chips

#### 6. GasPredictionWidget (`components/ai/GasPredictionWidget.tsx`)
**Location**: Network/analytics pages (to be integrated)

**Features:**
- ✅ Real-time gas price prediction
- ✅ Trend indicator (increasing/decreasing/stable)
- ✅ Confidence score
- ✅ Recommendations

**UI Elements:**
- Gas price display (large)
- Trend icon + label
- Confidence percentage
- Recommendation banner

## 🔌 Integration Points

### Transaction Page (`app/transactions/[hash]/page.tsx`)

```typescript
<TransactionAI
  txHash={hash}
  fromAddress={tx.sender}
  gasUsed={tx.gas_used?.toString()}
  gasPrice={tx.fee ? (parseFloat(tx.fee) / tx.gas_used).toString() : undefined}
/>
```

**Position**: After main transaction details card, before "Additional Information"

### Address Page (`app/accounts/[address]/page.tsx`)

```typescript
<AddressAI address={address} />
```

**Position**: After risk score, before balance history chart

### Contract Page (`app/contracts/[address]/page.tsx`)

```typescript
<ContractFunctionExplainer
  contractAddress={contract.address}
  abi={contract.abi}
/>
```

**Position**: In "Code" tab, after ABI Viewer

### Global Layout (`app/layout.tsx`)

```typescript
<AISidebarProvider />
```

**Position**: Root layout, renders floating button + sidebar

## 🎨 UX Principles

### 1. Inline, Not Intrusive
- AI features appear as cards/sections within existing pages
- No popups or modals blocking content
- Sidebar slides in from right, doesn't overlay content

### 2. Explainable
- Every risk score includes explanation
- Recommendations include reasoning
- AI summaries are clear and concise

### 3. Quick Actions
- One-click explanations
- Expandable details
- Suggested questions for chat

### 4. Loading States
- Skeleton loaders during AI analysis
- Spinner indicators for async operations
- Graceful error handling

### 5. Context Awareness
- AI sidebar knows current page
- Function explainer uses contract ABI
- Transaction analysis uses actual gas data

## 🔄 Data Flow

```
User Action
    ↓
React Component
    ↓
Custom Hook (useAI.ts)
    ↓
API Client (api-client.ts)
    ↓
Unified API (/api/v1/ai/*)
    ↓
AI Service (NestJS)
    ↓
Response → Component → UI Update
```

## 📊 Caching Strategy

- **Transaction Analysis**: 5 minutes (transactions don't change)
- **Contract Audit**: 10 minutes (contracts rarely change)
- **Gas Prediction**: 30 seconds (gas changes frequently, auto-refresh every minute)
- **Anomaly Detection**: 2 minutes (address behavior changes slowly)
- **Portfolio Optimization**: 10 minutes (portfolio changes slowly)

## 🚀 Future Enhancements

### Phase 2 (Planned)
1. **Token Page Integration** - Add TokenSafety component to token detail pages
2. **Network Dashboard** - Integrate GasPredictionWidget into analytics dashboard
3. **Streaming Responses** - SSE/WebSocket for long-running AI operations
4. **Pro Features** - Rate limiting and billing for advanced AI features
5. **Export Reports** - PDF export of AI analyses
6. **Comparison Mode** - Compare multiple addresses/contracts side-by-side

### Phase 3 (Ideas)
1. **AI-Powered Search** - Natural language search ("show me high-risk addresses")
2. **Predictive Analytics** - Predict token prices, transaction success rates
3. **Automated Alerts** - Notify users of anomalies or opportunities
4. **Batch Analysis** - Analyze multiple transactions/addresses at once

## 🔒 Security Considerations

- ✅ No private keys exposed (only hashes, addresses, ABIs)
- ✅ Rate limiting on AI endpoints (via API keys)
- ✅ Input validation (addresses, hashes)
- ✅ Error handling (graceful degradation)
- ✅ Context sanitization (prevent injection)

## 📝 Testing Checklist

- [x] Transaction analysis loads correctly
- [x] Address risk score displays
- [x] Contract function explainer works
- [x] AI sidebar opens/closes
- [x] Context detection works (transaction/address/contract)
- [x] Loading states display properly
- [x] Error states handled gracefully
- [x] Caching works as expected
- [ ] Token safety panel (pending token page)
- [ ] Gas prediction widget (pending network page)

## 🎯 Success Metrics

- **User Engagement**: % of users clicking "Explain Transaction"
- **Risk Detection**: Number of high-risk addresses flagged
- **Chat Usage**: Messages sent to AI assistant
- **Portfolio Optimization**: Users following recommendations
- **Performance**: Average AI response time < 2 seconds

---

**Status**: ✅ **COMPLETE** - All core AI features integrated into NorExplorer

**Last Updated**: January 2025

