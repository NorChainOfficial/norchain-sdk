# NorChain Ecosystem - Complete Product Mapping

## 🌍 Overview

The NorChain ecosystem is a **Full-Stack Blockchain Operating System** consisting of 16 modular, focused applications. Each application serves a specific purpose, competing with world-class analogues, but unified under one chain, one token (NOR), and one API.

---

## 🏗️ Architecture Principles

### Core Philosophy
- **Focused Apps**: Each frontend has a single mission (Explorer ≠ DEX ≠ Chat)
- **Shared Identity**: One NorID for all services (SSO via Supabase Auth)
- **Shared Token (NOR)**: One economy, one payment gateway (NorPay)
- **Shared Ledger**: Every transaction, invoice, or subscription recorded in NorLedger
- **Compliance by Default**: All apps use Policy Gateway for AML/KYC checks
- **Cross-Linking**: Apps are modular but interconnected

### Technology Stack
- **Backend**: Unified API (NestJS) - Single source of truth
- **Frontend**: Next.js 14 (Server Components by default)
- **Database**: PostgreSQL (via Unified API only)
- **Cache**: Redis (via Unified API)
- **Auth**: Supabase Auth (NorID SSO)
- **Real-time**: WebSocket (via Unified API)

---

## 📦 Product Catalog

### 1. 🔍 NorExplorer

**Status**: ✅ **PRODUCTION READY**  
**Location**: `apps/explorer`  
**Port**: 4002 (external), 3002 (internal)  
**Competes with**: BscScan, Etherscan, PolygonScan, TronScan

**Purpose**:  
Public blockchain explorer and analytics dashboard — purely for transparency and developer insight.

**Core Features**:
- ✅ View blocks, transactions, internal tx, gas, logs
- ✅ View token transfers, holders, contract source/ABI
- ✅ Address pages: balance, transactions, token list, risk score
- ✅ Token info: supply, price (from NEX), logo, metadata
- ✅ Contract verification (API-integrated with `/contract/verifycontract`)
- ✅ Block/Tx analytics: gas usage, fee trends
- ✅ Node/network health dashboard
- ✅ Public API key registration (free tier)

**Focus**: Visibility & verification, not payments or trading. Minimal UI, maximum performance.

**API Dependencies**:
- `/api/v1/block/*` - Block operations
- `/api/v1/transaction/*` - Transaction operations
- `/api/v1/account/*` - Account operations
- `/api/v1/token/*` - Token information
- `/api/v1/contract/*` - Contract verification
- `/api/v1/stats/*` - Network statistics

---

### 2. 💳 NorPay

**Status**: 🚧 **TO BE IMPLEMENTED**  
**Location**: `apps/norpay` (to be created)  
**Port**: 4003 (external), 3003 (internal)  
**Competes with**: Stripe, PayPal, BoomFi, Radom

**Purpose**:  
Blockchain-native payment gateway for merchants, platforms, and SaaS subscriptions.

**Core Features**:
- Merchant dashboard (products, pricing, invoices)
- Hosted checkout & embeddable widget
- Subscriptions (monthly/yearly in NOR)
- Webhooks (payment.succeeded, subscription.renewed)
- Refunds, partial refunds
- On-chain escrow & settlement
- POS (Point-of-Sale) interface
- Integration SDKs (`@norchain/pay-react`, `@norchain/pay-node`)

**Focus**: Simple gateway & billing layer — everything financial but not accounting.

**API Dependencies** (to be implemented):
- `/api/v1/pay/checkout` - Create checkout session
- `/api/v1/pay/invoices` - Invoice management
- `/api/v1/pay/subscriptions` - Subscription management
- `/api/v1/pay/webhooks` - Webhook handling
- `/api/v1/pay/refunds` - Refund operations
- `/api/v1/compliance/*` - KYC/AML checks

**Integration Points**:
- NorLedger: All payments recorded automatically
- NorChat: "Pay in Chat" integration
- NorWallet: Direct wallet integration

---

### 3. 📒 NorLedger

**Status**: 🚧 **TO BE IMPLEMENTED**  
**Location**: `apps/norledger` (to be created)  
**Port**: 4004 (external), 3004 (internal)  
**Competes with**: QuickBooks, Xero, Request Finance

**Purpose**:  
Double-entry accounting and journal system for all blockchain-linked financial activity.

**Core Features**:
- Chart of Accounts
- Journals & postings (automated from NorPay events)
- VAT / MVA handling
- Reconciliation (ledger vs. wallet vs. on-chain)
- Period close, trial balance, audit export
- Merkle anchoring of books to NorChain (daily)
- Supabase backend + GraphQL

**Focus**: Only bookkeeping and financial integrity, not full ERP or payroll.

**API Dependencies** (to be implemented):
- `/api/v1/ledger/accounts` - Chart of accounts
- `/api/v1/ledger/journals` - Journal entries
- `/api/v1/ledger/reconciliation` - Reconciliation operations
- `/api/v1/ledger/reports` - Financial reports
- `/api/v1/ledger/merkle` - Merkle anchoring

**Integration Points**:
- NorPay: Automatic journal entries
- NorRegnskap: Real-time sync
- NorChain: Daily merkle anchoring

---

### 4. 🧾 NorRegnskap

**Status**: 🚧 **TO BE IMPLEMENTED**  
**Location**: `apps/norregnskap` (to be created)  
**Port**: 4005 (external), 3005 (internal)  
**Competes with**: Fiken.no, DNB Regnskap, Tripletex

**Purpose**:  
A full ERP and accounting SaaS suite for SMEs and startups using NOR as billing unit.

**Core Features**:
- Invoices, offers, expenses, receipts (OCR import)
- Payroll & A-melding reports
- Project accounting & cost centers
- Tax/VAT/MVA reporting to Altinn
- Bank reconciliation (NorPay + OpenBanking)
- Real-time sync with NorLedger
- Multi-language (NO/EN)

**Focus**: Enterprise-grade business accounting & reporting. Runs on NorLedger for audit integrity.

**API Dependencies** (to be implemented):
- `/api/v1/regnskap/invoices` - Invoice management
- `/api/v1/regnskap/expenses` - Expense tracking
- `/api/v1/regnskap/payroll` - Payroll operations
- `/api/v1/regnskap/reports` - Tax/VAT reports
- `/api/v1/regnskap/ocr` - Receipt OCR

**Integration Points**:
- NorLedger: Real-time sync
- NorPay: Payment reconciliation
- Altinn: Tax reporting

---

### 5. 💬 NorChat

**Status**: 🚧 **TO BE IMPLEMENTED**  
**Location**: `apps/norchat` (to be created)  
**Port**: 4006 (external), 3006 (internal)  
**Competes with**: WhatsApp, Signal, Telegram, XMTP

**Purpose**:  
Encrypted messaging and collaboration platform integrated with blockchain identity and payments.

**Core Features**:
- E2EE chat & media
- Voice/video calls (WebRTC)
- "Pay in Chat" (via NorPay)
- Verified business profiles (Metadata module)
- Group channels & file sharing
- On-chain identity (NorID, DID, wallet-based)
- Business APIs for notifications (invoice/chat integration)

**Focus**: Communication layer for users, merchants, and developers — human interface of the blockchain.

**API Dependencies** (to be implemented):
- `/api/v1/chat/messages` - Message operations
- `/api/v1/chat/channels` - Channel management
- `/api/v1/chat/calls` - WebRTC signaling
- `/api/v1/metadata/*` - Identity & profiles
- `/api/v1/pay/*` - Payment integration

**Integration Points**:
- NorPay: "Pay in Chat"
- NorID: Identity verification
- NorWallet: Wallet integration

---

### 6. 💱 NorSwap

**Status**: 🚧 **TO BE IMPLEMENTED**  
**Location**: `apps/norswap` (to be created)  
**Port**: 4007 (external), 3007 (internal)  
**Competes with**: Uniswap, PancakeSwap, 1inch

**Purpose**:  
Decentralized swap interface for token-to-token trading on NorChain.

**Core Features**:
- Token search and live quotes (`/swap/quote`)
- Slippage controls & gas estimates (`/ai/predict-gas`)
- NOR, stablecoins, and wrapped tokens
- On-chain receipts & explorer integration
- Simple & Pro modes
- Wallet connect (MetaMask, Trust, NorWallet)

**Focus**: Instant swaps, liquidity visualization, price impact — nothing beyond AMM functionality.

**API Dependencies**:
- `/api/v1/swap/quote` - ✅ Already implemented
- `/api/v1/swap/execute` - ✅ Already implemented
- `/api/v1/ai/predict-gas` - ✅ Already implemented
- `/api/v1/token/*` - ✅ Already implemented

**Integration Points**:
- NorExplorer: Transaction links
- NorWallet: Wallet connect
- NEX: Price feeds

---

### 7. 📊 NorDEX (Pro)

**Status**: 🚧 **TO BE IMPLEMENTED**  
**Location**: `apps/nordex` (to be created)  
**Port**: 4008 (external), 3008 (internal)  
**Competes with**: Binance, Firi, KuCoin, Kraken

**Purpose**:  
Professional orderbook-based DEX with KYC and compliance built-in.

**Core Features**:
- Spot trading (limit, market, stop-loss, DCA)
- Portfolio dashboard
- Real-time streaming orderbook
- Charting (Candlesticks, Depth)
- On-chain order matching
- Compliance enforcement via Policy Gateway
- Wallet connect + custodial option (for regulated use)

**Focus**: Regulated, high-performance exchange for traders and institutions.

**API Dependencies**:
- `/api/v1/orders/*` - ✅ Already implemented (limit, stop-loss, DCA)
- `/api/v1/compliance/*` - ✅ Already implemented
- `/api/v1/analytics/portfolio` - ✅ Already implemented
- `/api/v1/dex/pools` - 🚧 To be implemented
- `/api/v1/dex/orderbook` - 🚧 To be implemented

**Integration Points**:
- NorCompliance Hub: KYC/AML checks
- NorExplorer: Transaction verification
- NorWallet: Wallet integration

---

### 8. 🪙 NEX (NorChain Exchange)

**Status**: ✅ **EXISTS** (needs enhancement)  
**Location**: `apps/nex-exchange`  
**Port**: 4001 (external), 3001 (internal)  
**Competes with**: Firi.no, Coinbase

**Purpose**:  
Retail on/off-ramp exchange for NOR and bridged assets (BTCBR, ETHBR, etc.).

**Core Features**:
- ✅ Simple buy/sell interface
- 🚧 Auto KYC/AML via Policy Gateway (to be enhanced)
- 🚧 Local fiat integrations (BankID, Vipps, SEPA) (to be implemented)
- ✅ Portfolio overview
- 🚧 Instant transfers to NorWallet (to be enhanced)
- 🚧 NOR staking dashboard (to be implemented)

**Focus**: Beginner-friendly retail gateway — simple, safe, compliant.

**API Dependencies**:
- `/api/v1/swap/*` - ✅ Already implemented
- `/api/v1/orders/*` - ✅ Already implemented
- `/api/v1/compliance/*` - ✅ Already implemented
- `/api/v1/staking/*` - 🚧 To be implemented
- `/api/v1/fiat/*` - 🚧 To be implemented

**Integration Points**:
- NorCompliance Hub: KYC/AML
- NorWallet: Direct transfers
- NorExplorer: Transaction links

---

### 9. 🌉 NorBridge

**Status**: ✅ **API READY** (needs frontend)  
**Location**: `apps/norbridge` (to be created)  
**Port**: 4009 (external), 3009 (internal)  
**Competes with**: Synapse, Multichain, Wormhole

**Purpose**:  
Cross-chain asset transfer system between NorChain, BSC, Ethereum, and Tron.

**Core Features**:
- Bridge quotes (`/bridge/quotes`)
- Transfer tracking (`/bridge/transfers/{id}`)
- Inclusion proof (`/bridge/transfers/{id}/proof`)
- Treasury routing
- Validator-signed confirmation
- Transaction receipts for Explorer

**Focus**: Liquidity and interoperability, not trading.

**API Dependencies**:
- `/api/v1/bridge/quotes` - ✅ Already implemented
- `/api/v1/bridge/transfers` - ✅ Already implemented
- `/api/v1/bridge/transfers/{id}` - ✅ Already implemented
- `/api/v1/bridge/transfers/{id}/proof` - ✅ Already implemented

**Integration Points**:
- NorExplorer: Transfer verification
- NorWallet: Direct bridge access
- NorChain: Validator signatures

---

### 10. 🏦 NorCompliance Hub

**Status**: ✅ **API READY** (needs frontend)  
**Location**: `apps/norcompliance` (to be created)  
**Port**: 4012 (external), 3012 (internal)  
**Competes with**: Chainalysis, TRM Labs, Notabene

**Purpose**:  
Regulatory & compliance engine — ensuring trust across all NorChain apps.

**Core Features**:
- Address risk scoring (`/compliance/risk-scores`)
- KYC/AML screening (`/compliance/screenings`)
- Travel Rule API
- Case management for compliance officers
- Reports export (JSON, PDF)
- Integration with NorPay, NorDEX, NorLedger

**Focus**: Backend enforcement, not consumer UX. Used by all services to validate activity.

**API Dependencies**:
- `/api/v1/compliance/screenings` - ✅ Already implemented
- `/api/v1/compliance/risk-scores` - ✅ Already implemented
- `/api/v1/compliance/cases` - ✅ Already implemented
- `/api/v1/compliance/travel-rule` - ✅ Already implemented

**Integration Points**:
- All apps: Compliance checks
- NorPay: Payment screening
- NorDEX: Trading compliance
- NorLedger: Audit trail

---

### 11. 🧠 NorAI

**Status**: ✅ **INTEGRATED INTO EXPLORER**  
**Location**: `apps/explorer/components/ai/`  
**Port**: N/A (uses Explorer's port 4002)  
**Competes with**: ChainGPT, Arkham Intelligence

**Purpose**:  
AI analytics and automation layer powering predictions, anomaly detection, and chatbots — integrated directly into Explorer for contextual insights.

**Core Features**:
- ✅ Transaction analysis (`/ai/analyze-transaction`) - Integrated in transaction pages
- ✅ Contract auditing (`/ai/audit-contract`) - Integrated in contract pages
- ✅ Gas prediction (`/ai/predict-gas`) - Integrated in analytics dashboard
- ✅ Anomaly detection (`/ai/detect-anomalies`) - Integrated in address pages
- ✅ Portfolio optimization (`/ai/optimize-portfolio`) - Integrated in analytics portfolio
- ✅ Chat assistant (`/ai/chat`) - Global widget on all pages

**Focus**: Pure AI engine to augment Explorer — invisible but integral, providing contextual insights throughout the exploration journey.

**API Dependencies**:
- `/api/v1/ai/analyze-transaction` - ✅ Implemented & Integrated
- `/api/v1/ai/audit-contract` - ✅ Implemented & Integrated
- `/api/v1/ai/predict-gas` - ✅ Implemented & Integrated
- `/api/v1/ai/detect-anomalies` - ✅ Implemented & Integrated
- `/api/v1/ai/optimize-portfolio` - ✅ Implemented & Integrated
- `/api/v1/ai/chat` - ✅ Implemented & Integrated

**Integration Points**:
- ✅ Explorer: All AI features integrated contextually
- ✅ Transaction pages: AI analysis
- ✅ Contract pages: Security audit
- ✅ Address pages: Anomaly detection
- ✅ Analytics: Gas prediction & portfolio optimization
- ✅ Global: AI chat widget

---

### 12. ⚙️ NorDev Portal

**Status**: ✅ **EXISTS** (needs enhancement)  
**Location**: `apps/dev-portal`  
**Port**: 4014 (external), 3014 (internal)  
**Competes with**: Alchemy, Infura, Supabase

**Purpose**:  
Developer hub — single entrypoint for APIs, SDKs, documentation, and usage billing in NOR.

**Core Features**:
- ✅ API keys & scopes (`/auth/api-keys`)
- 🚧 Usage analytics (per endpoint) (to be enhanced)
- ✅ SDKs (JS, Python, PHP, Go) (packages/sdk)
- ✅ API playground (Swagger integrated)
- 🚧 Webhooks tester (to be implemented)
- 🚧 Billing via NorPay (in NOR) (to be implemented)
- 🚧 AI Dev Assistant (to be implemented)

**Focus**: Empower developers, not end-users. Fuel the builder ecosystem.

**API Dependencies**:
- `/api/v1/auth/api-keys` - ✅ Already implemented
- `/api/v1/auth/usage` - 🚧 To be implemented
- `/api/v1/pay/*` - 🚧 For billing integration

**Integration Points**:
- Unified API: All endpoints
- NorPay: Usage billing
- Documentation: API docs

---

### 13. 🧰 NorAdmin / BackOffice

**Status**: 🚧 **TO BE IMPLEMENTED**  
**Location**: `apps/noradmin` (to be created)  
**Port**: 4015 (external), 3015 (internal)  
**Competes with**: Firebase Console, AWS Dashboard

**Purpose**:  
Internal administration panel for governance, policies, validators, and treasury.

**Core Features**:
- User management
- Policy rules configuration
- Validator & node health
- Treasury distribution settings
- Audit log explorer
- Live metrics dashboard (Prometheus, Grafana)

**Focus**: Operational backbone — used by NorChain team and validators only.

**API Dependencies** (to be implemented):
- `/api/v1/admin/users` - User management
- `/api/v1/admin/policies` - Policy configuration
- `/api/v1/admin/validators` - Validator management
- `/api/v1/admin/treasury` - Treasury operations
- `/api/v1/admin/audit` - Audit logs
- `/api/v1/admin/metrics` - System metrics

**Integration Points**:
- All apps: Administrative control
- NorChain: Validator management
- Policy Gateway: Rule configuration

---

### 14. 🗳️ NorGovernance

**Status**: ✅ **API READY** (needs frontend)  
**Location**: `apps/norgovernance` (to be created)  
**Port**: 4016 (external), 3016 (internal)  
**Competes with**: Aragon, ENS DAO

**Purpose**:  
Decentralized governance and treasury management.

**Core Features**:
- Create proposals (`/governance/proposals`)
- Vote & delegate (`/governance/votes`)
- Tally results (`/governance/tally`)
- Treasury view (NOR income from SaaS)
- Execution history (on-chain)

**Focus**: DAO for system upgrades, tokenomics, grants, and treasury.

**API Dependencies**:
- `/api/v1/governance/proposals` - ✅ Already implemented
- `/api/v1/governance/votes` - ✅ Already implemented
- `/api/v1/governance/tally` - ✅ Already implemented

**Integration Points**:
- NorChain: On-chain execution
- NorAdmin: Proposal management
- Treasury: Fund allocation

---

### 15. 💼 NorWallet (App & Extension)

**Status**: ✅ **EXISTS** (in backup, needs integration)  
**Location**: `backup/wallets/`  
**Port**: 4020 (external), 4020 (internal)  
**Competes with**: MetaMask, TrustWallet

**Purpose**:  
Secure multi-network wallet for NOR and bridged tokens.

**Core Features**:
- ✅ Store/send/receive tokens
- 🚧 In-app bridge (to BSC, ETH, TRON) (to be enhanced)
- 🚧 Support for NFTs & asset profiles (to be implemented)
- 🚧 Direct access to NorPay, NorSwap, NorChat (to be implemented)
- ✅ DApp browser
- ✅ FaceID/TouchID security

**Focus**: User-owned asset control — gateway to all other NorChain services.

**API Dependencies**:
- `/api/v1/wallet/*` - ✅ Already implemented
- `/api/v1/bridge/*` - ✅ Already implemented
- `/api/v1/metadata/*` - 🚧 To be implemented

**Integration Points**:
- All apps: Wallet connect
- NorPay: Payment integration
- NorSwap: Swap integration
- NorBridge: Bridge integration

---

### 16. 📈 NorAnalytics

**Status**: 🚧 **TO BE IMPLEMENTED**  
**Location**: `apps/noranalytics` (to be created)  
**Port**: 4017 (external), 3017 (internal)  
**Competes with**: Nansen, Dune, Arkham

**Purpose**:  
Analytical platform for blockchain data, DeFi trends, and token insights.

**Core Features**:
- Transaction heatmaps
- Portfolio analysis
- Token trends
- Whale tracking
- AI risk scoring
- Public dashboards

**Focus**: Insights and transparency for investors and regulators.

**API Dependencies**:
- `/api/v1/analytics/*` - ✅ Already implemented (portfolio, transactions, network)
- `/api/v1/ai/*` - ✅ Already implemented (risk scoring)
- `/api/v1/stats/*` - ✅ Already implemented

**Integration Points**:
- NorExplorer: Data source
- NorAI: Risk scoring
- NorCompliance: Regulatory insights

---

## 🔗 Integration Matrix

| App | NorExplorer | NorPay | NorLedger | NorChat | NorSwap | NorDEX | NEX | NorBridge | NorCompliance | NorAI | NorDev | NorAdmin | NorGovernance | NorWallet | NorAnalytics |
|-----|-------------|--------|-----------|---------|---------|--------|-----|-----------|---------------|------|--------|----------|---------------|-----------|--------------|
| **NorExplorer** | - | Link | Link | - | Link | Link | Link | Link | Risk Score | - | API Docs | - | - | Link | Data |
| **NorPay** | Receipt | - | Auto Sync | Pay in Chat | - | - | - | - | KYC Check | Fraud | - | - | - | Wallet | - |
| **NorLedger** | Verify | Auto | - | - | - | - | - | - | Audit | - | - | - | - | - | Reports |
| **NorChat** | - | Pay | - | - | - | - | - | - | Identity | Chat | - | - | - | Wallet | - |
| **NorSwap** | Tx Link | - | - | - | - | - | Price | Bridge | Risk | Gas | - | - | - | Wallet | Analytics |
| **NorDEX** | Tx Link | - | - | - | - | - | - | - | KYC | Anomaly | - | - | - | Wallet | Analytics |
| **NEX** | Tx Link | - | - | - | Price | - | - | - | KYC | - | - | - | - | Wallet | - |
| **NorBridge** | Proof | - | - | - | - | - | - | - | Risk | - | - | - | - | Wallet | - |
| **NorCompliance** | Risk | KYC | Audit | Identity | Risk | KYC | KYC | Risk | - | Fraud | - | - | - | - | Reports |
| **NorAI** | - | Fraud | - | Chat | Gas | Anomaly | - | - | Fraud | - | Assistant | - | - | - | Scoring |
| **NorDev** | API | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| **NorAdmin** | - | - | - | - | - | - | - | - | Rules | - | - | - | Policies | - | - |
| **NorGovernance** | - | - | - | - | - | - | - | - | - | - | - | Admin | - | - | - |
| **NorWallet** | View | Pay | - | Chat | Swap | Trade | Buy | Bridge | - | - | - | - | - | - |
| **NorAnalytics** | Data | - | Reports | - | Analytics | Analytics | - | - | Reports | Scoring | - | - | - | - | - |

**Legend**:
- **Link**: Direct link/navigation
- **Auto Sync**: Automatic data synchronization
- **KYC Check**: Compliance verification
- **Risk Score**: Risk assessment
- **Data**: Data source
- **Verify**: Verification/validation
- **-**: No direct integration

---

## 📊 Implementation Status

### ✅ Production Ready (3 apps)
1. **NorExplorer** - Complete and production-ready
2. **NEX Exchange** - Functional, needs enhancements
3. **NorDev Portal** - Basic implementation, needs enhancement

### ✅ API Ready, Frontend Needed (5 apps)
4. **NorBridge** - API complete, needs frontend
5. **NorCompliance Hub** - API complete, needs frontend
6. **NorAI** - Partial API, needs frontend
7. **NorGovernance** - API complete, needs frontend
8. **NorWallet** - Exists in backup, needs integration

### 🚧 To Be Implemented (8 apps)
9. **NorPay** - Payment gateway
10. **NorLedger** - Accounting system
11. **NorRegnskap** - ERP suite
12. **NorChat** - Messaging platform
13. **NorSwap** - DEX swap interface
14. **NorDEX** - Professional DEX
15. **NorAdmin** - Admin panel
16. **NorAnalytics** - Analytics platform

---

## 🎯 Next Steps

### Phase 1: Core Financial Infrastructure (Q1)
1. **NorPay** - Payment gateway foundation
2. **NorLedger** - Accounting backbone
3. **NorBridge Frontend** - Complete bridge UX

### Phase 2: Trading & Exchange (Q2)
4. **NorSwap** - DEX swap interface
5. **NorDEX** - Professional exchange
6. **NEX Enhancements** - Fiat integration, staking

### Phase 3: Business Tools (Q3)
7. **NorRegnskap** - ERP suite
8. **NorChat** - Communication layer
9. **NorAnalytics** - Analytics platform

### Phase 4: Infrastructure & Admin (Q4)
10. **NorAdmin** - Backoffice panel
11. **NorAI Frontend** - AI dashboard
12. **NorCompliance Frontend** - Compliance UI
13. **NorGovernance Frontend** - Governance UI
14. **NorDev Portal Enhancements** - Complete developer experience
15. **NorWallet Integration** - Full ecosystem integration

---

## 📝 Notes

- All apps consume the **Unified API** (`apps/api`) - no direct database access
- All apps use **Supabase Auth** for NorID SSO
- All apps integrate with **Policy Gateway** for compliance
- All financial transactions flow through **NorLedger** for audit integrity
- All apps are **modular** and can be deployed independently
- All apps follow **Next.js 14** patterns (Server Components by default)

---

**Last Updated**: January 2025  
**Status**: Ecosystem mapping complete, implementation in progress

