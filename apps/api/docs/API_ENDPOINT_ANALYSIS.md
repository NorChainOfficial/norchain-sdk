# NorChain API Endpoint Analysis

## Comparison with API Layer Overview

This document compares our current API implementation with the comprehensive API Layer Overview provided, identifying gaps and missing endpoints.

---

## ✅ Currently Implemented Endpoints

### 1. Chain & Accounts (`/v1/chain`, `/v1/accounts`)

**Implemented:**
- ✅ `GET /api/v1/block/*` - Block operations
- ✅ `GET /api/v1/account/*` - Account operations (balance, transactions, tokens)
- ✅ `GET /api/v1/blockchain/*` - Blockchain state (state-root, validators, consensus)
- ✅ `GET /api/v1/transaction/*` - Transaction operations
- ✅ `GET /api/v1/analytics/portfolio` - Portfolio summary

**Missing from Overview:**
- ❌ `GET /v1/chain/blocks?from=…&to=…` (cursor-paginated)
- ❌ `GET /v1/chain/txs/{hash}` (REST endpoint)
- ❌ `GET /v1/chain/proofs` (state proofs for bridge/verifier)
- ❌ `GET /v1/accounts/{address}/portfolio` (comprehensive portfolio)
- ❌ `POST /v1/txs` (idempotent transaction submission with policy checks)

### 2. Tokens (`/v1/tokens`)

**Implemented:**
- ✅ `GET /api/v1/token/*` - Token operations (supply, balance, info, transfers)
- ✅ `GET /api/v1/token/{address}/holders` - Token holders

**Missing from Overview:**
- ❌ `GET /v1/tokens/{address}/holders?cursor=…` (cursor pagination)
- ❌ `GET /v1/tokens/{address}/allowances` (ERC-20 allowances)

### 3. DEX (`/v1/dex`)

**Implemented:**
- ✅ `GET /api/v1/swap/quote` - Swap quote generation
- ✅ `POST /api/v1/swap/execute` - Swap execution
- ✅ `GET /api/v1/orders/*` - Limit orders, DCA, stop-loss

**Missing from Overview:**
- ❌ `GET /v1/dex/pools/{poolId}` (pool information)
- ❌ `GET /v1/dex/pools/{poolId}/ticks` (liquidity ticks)
- ❌ `GET /v1/dex/pools/{poolId}/swaps` (swap history)
- ❌ `GET /v1/dex/tvl` (total value locked)
- ❌ `GET /v1/dex/fees` (fee statistics)

### 4. Bridge (`/v1/bridge`)

**Status: ❌ NOT IMPLEMENTED**

**Missing:**
- ❌ `POST /v1/bridge/quotes` (src/dst chain, token, amount)
- ❌ `POST /v1/bridge/transfers` (create transfer; returns transfer_id)
- ❌ `GET /v1/bridge/transfers/{id}` (transfer status)
- ❌ `GET /v1/bridge/proofs/{id}` (inclusion proofs)

### 5. Identity & Compliance (`/v1/identity`, `/v1/compliance`)

**Status: ❌ NOT IMPLEMENTED**

**Missing:**
- ❌ `POST /v1/identity/kyc/start` → `GET /v1/identity/kyc/{sessionId}`
- ❌ `POST /v1/compliance/screenings` (sanctions, watchlists)
- ❌ `GET /v1/compliance/cases/{id}` (case management)
- ❌ `GET /v1/compliance/risk-scores/{address}` (compliance scoring)
- ❌ `POST /v1/compliance/travel-rule` (Travel Rule payloads)

### 6. Governance (`/v1/governance`)

**Status: ❌ NOT IMPLEMENTED**

**Missing:**
- ❌ `GET /v1/governance/proposals` (list proposals)
- ❌ `GET /v1/governance/proposals/{id}` (proposal details)
- ❌ `POST /v1/governance/votes` (submit vote; policy-gated)
- ❌ `GET /v1/governance/tallies/{proposalId}` (vote tallies)
- ❌ `GET /v1/governance/params` (governance parameters)

### 7. Payments (`/v1/payments`)

**Status: ❌ NOT IMPLEMENTED**

**Missing:**
- ❌ `POST /v1/payments/invoices` (create invoice)
- ❌ `GET /v1/payments/invoices/{id}` (invoice status)
- ❌ `POST /v1/payments/pos/sessions` (POS session creation)
- ❌ `GET /v1/payments/merchants/{id}/settlements` (merchant settlements)

### 8. Analytics (`/v1/analytics`)

**Implemented:**
- ✅ `GET /api/v1/analytics/portfolio` - Portfolio summary
- ✅ `GET /api/v1/analytics/transactions` - Transaction analytics
- ✅ `GET /api/v1/analytics/network` - Network statistics

**Missing from Overview:**
- ❌ `GET /v1/analytics/gas` (gas usage analytics)
- ❌ `GET /v1/analytics/throughput` (TPS metrics)
- ❌ `GET /v1/analytics/finality` (finality time analytics)
- ❌ `GET /v1/analytics/hotspots` (network hotspots)

### 9. Admin (`/v1/admin`)

**Status: ❌ NOT IMPLEMENTED**

**Missing:**
- ❌ `GET /v1/admin/validators` (validator management)
- ❌ `POST /v1/admin/params` (parameter changes → governance)
- ❌ `GET /v1/admin/slashing` (slashing events)
- ❌ `POST /v1/admin/feature-flags` (feature flag management)
- ❌ `GET /v1/admin/audit-log` (audit trail)

### 10. Wallet (`/v1/wallet`)

**Implemented:**
- ✅ `POST /api/v1/wallet` - Create wallet
- ✅ `POST /api/v1/wallet/import` - Import wallet
- ✅ `GET /api/v1/wallet` - List wallets
- ✅ `GET /api/v1/wallet/{address}` - Get wallet details
- ✅ `GET /api/v1/wallet/{address}/balance` - Get balance
- ✅ `GET /api/v1/wallet/{address}/tokens` - Get tokens
- ✅ `GET /api/v1/wallet/{address}/transactions` - Get transactions
- ✅ `POST /api/v1/wallet/{address}/send` - Send transaction
- ✅ `DELETE /api/v1/wallet/{address}` - Delete wallet

**Note:** Wallet module is implemented but needs deployment verification.

---

## 📊 Implementation Status Summary

| Category | Status | Coverage |
|----------|--------|----------|
| Chain & Accounts | 🟡 Partial | 60% |
| Tokens | 🟡 Partial | 70% |
| DEX | 🟡 Partial | 40% |
| Bridge | ❌ Missing | 0% |
| Identity & Compliance | ❌ Missing | 0% |
| Governance | ❌ Missing | 0% |
| Payments | ❌ Missing | 0% |
| Analytics | 🟡 Partial | 50% |
| Admin | ❌ Missing | 0% |
| Wallet | ✅ Complete | 100% |

---

## 🔍 Missing Critical Features

### 1. Policy Gateway
- ❌ Pre-transaction policy checks (KYC, sanctions, velocity)
- ❌ Post-transaction hooks (webhooks, audit logs)
- ❌ Idempotency support (`Idempotency-Key` header)

### 2. JSON-RPC Extensions
- ❌ `nor_getComplianceScore(address)`
- ❌ `nor_getSanctionsStatus(address)`
- ❌ `nor_getFinalityStatus(blockHash|number)`
- ❌ `nor_traceTransaction(txHash)`
- ❌ `nor_feeHistory` (PoSA-specific)

### 3. WebSocket Topics
- ❌ `nor.bridge.events`
- ❌ `nor.dex.swaps`
- ❌ `nor.gov.proposals`
- ❌ `nor.compliance.flags`

### 4. GraphQL API
- ❌ GraphQL schema and resolvers
- ❌ Directives: `@snapshot`, `@range`, `@final`

### 5. Event Streams
- ❌ Kafka/Redpanda topics
- ❌ Webhook delivery system
- ❌ Replay capability

### 6. Security Features
- ❌ Request signing (`X-Signature`, `X-Timestamp`)
- ❌ mTLS for partner channels
- ❌ Token binding to IP/scopes
- ❌ WAF + Bot control

### 7. Rate Limiting & SLAs
- ✅ Basic throttling implemented
- ❌ Role-based rate limits
- ❌ SLA tiers (Public, Partner, Validator)
- ❌ Fair-use scheduler

### 8. Versioning
- ✅ URI versioning (`/api/v1/`)
- ❌ Deprecation policy
- ❌ Sunset headers

### 9. Developer Experience
- ✅ Swagger/OpenAPI documentation
- ❌ Postman collections
- ❌ Typed SDKs (TS/Node, Go, Python, Swift/Kotlin)
- ❌ Mock servers
- ❌ Testnet mirrors

### 10. Observability
- ✅ Basic health checks
- ✅ Prometheus metrics
- ❌ W3C trace context
- ❌ Structured JSON logs
- ❌ Correlation IDs
- ❌ Circuit breakers

---

## 🎯 Priority Recommendations

### High Priority (Core Functionality)
1. **Bridge Module** (`/v1/bridge/*`)
   - Critical for cross-chain operations
   - BTCBR, ETHBR transfers
   - Proof generation

2. **Compliance Module** (`/v1/compliance/*`)
   - Required for regulated DeFi
   - KYC/AML integration
   - Sanctions screening
   - Travel Rule support

3. **Governance Module** (`/v1/governance/*`)
   - On-chain voting
   - Proposal management
   - Parameter changes

4. **Policy Gateway**
   - Pre-transaction checks
   - Idempotency support
   - Post-transaction hooks

### Medium Priority (Enhanced Features)
5. **DEX Enhancements**
   - Pool management endpoints
   - TVL and fee statistics
   - Tick data

6. **Analytics Enhancements**
   - Gas analytics
   - Throughput metrics
   - Finality analytics

7. **Admin Module** (`/v1/admin/*`)
   - Validator management
   - Feature flags
   - Audit logs

### Low Priority (Nice to Have)
8. **Payments Module** (`/v1/payments/*`)
   - Invoice management
   - POS integration
   - Merchant settlements

9. **GraphQL API**
   - Query-rich interface
   - Dashboard support

10. **Event Streams**
    - Kafka integration
    - Webhook system

---

## 📝 Next Steps

1. **Immediate Actions:**
   - ✅ Fix wallet module deployment
   - 🔄 Create Bridge module skeleton
   - 🔄 Create Compliance module skeleton
   - 🔄 Create Governance module skeleton

2. **Short-term (1-2 weeks):**
   - Implement Policy Gateway
   - Add JSON-RPC extensions
   - Enhance DEX endpoints
   - Add cursor pagination

3. **Medium-term (1 month):**
   - Complete Bridge module
   - Complete Compliance module
   - Complete Governance module
   - Add Admin module

4. **Long-term (2-3 months):**
   - GraphQL API
   - Event streams
   - Enhanced observability
   - SDK generation

---

## 🔗 Related Documentation

- [API Integration Tests](../test/api/README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Supabase Integration](./SUPABASE_COMPLETE_SETUP.md)

