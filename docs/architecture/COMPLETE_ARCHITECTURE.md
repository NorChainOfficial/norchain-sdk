# Complete Architecture Documentation
## NorChain Ecosystem

**Version**: 1.0  
**Last Updated**: November 2024

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [Network Architecture](#network-architecture)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)

---

## 1. System Overview

The NorChain Ecosystem is a unified blockchain platform consisting of multiple interconnected applications, all served by a single API backend.

### Core Principles
- **API-First**: All frontend applications consume the Unified API
- **Microservices**: Independent, scalable services
- **Containerization**: Docker-based deployment
- **Cross-Platform**: Web, Android, and iOS support
- **Unified Backend**: Single source of truth for all data

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                                  │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Explorer   │  │   Landing    │  │ NEX Exchange │  │   Wallet   │ │
│  │   (Next.js)  │  │   (Next.js)  │  │   (Next.js)  │  │  (Next.js)  │ │
│  │   Port 4002  │  │   Port 4010  │  │   Port 4001  │  │  Port 4020 │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ │
│         │                  │                  │                  │       │
│  ┌──────▼──────────────────▼──────────────────▼────────────────▼─────┐ │
│  │              Mobile Applications (Native)                           │ │
│  │  ┌──────────────┐                    ┌──────────────┐             │ │
│  │  │   Android    │                    │     iOS      │             │ │
│  │  │  (Kotlin)    │                    │   (Swift)    │             │ │
│  │  └──────────────┘                    └──────────────┘             │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                │ WebSocket
                                │
┌───────────────────────────────▼──────────────────────────────────────────┐
│                        Unified API Layer                                   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    Unified API (NestJS)                              │ │
│  │                      Port 4000 (External)                           │ │
│  │                      Port 3000 (Internal)                            │ │
│  │                                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │ │
│  │  │   Explorer   │  │   Exchange   │  │    Wallet    │             │ │
│  │  │   Modules    │  │   Modules    │  │   Modules    │             │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │ │
│  │                                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │ │
│  │  │  Auth        │  │  Rate Limit  │  │   Cache      │             │ │
│  │  │  (JWT)       │  │  Middleware  │  │  Manager     │             │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
┌───────────────▼────┐  ┌──────▼──────┐  ┌────▼────────────┐
│   PostgreSQL        │  │    Redis    │  │  NorChain RPC  │
│   Port 5433         │  │   Port 6380 │  │  (External)    │
│                     │  │             │  │                │
│  - Blocks           │  │  - Cache    │  │  - Blockchain │
│  - Transactions     │  │  - Sessions │  │  - Queries    │
│  - Accounts         │  │  - Rate Lim │  │  - Broadcast  │
│  - Orders           │  │             │  │                │
│  - Trades           │  │             │  │                │
└─────────────────────┘  └─────────────┘  └────────────────┘
```

---

## 3. Component Details

### 3.1 Frontend Applications

#### Explorer (`apps/explorer`)
- **Technology**: Next.js 14, TypeScript, Tailwind CSS
- **Port**: 4002 (external), 3002 (internal)
- **Purpose**: Blockchain explorer interface
- **Features**:
  - Block browser
  - Transaction explorer
  - Account analytics
  - Real-time updates
- **API Integration**: Connects to Unified API at `http://api:3000`

#### Landing Page (`apps/landing`)
- **Technology**: Next.js 14, TypeScript, Tailwind CSS
- **Port**: 4010 (external), 3010 (internal)
- **Purpose**: Marketing and information website
- **Features**:
  - Network statistics
  - Product overview
  - Community information
- **API Integration**: Fetches stats from Unified API

#### NEX Exchange (`apps/nex-exchange`)
- **Technology**: Next.js 14, TypeScript, Wagmi
- **Port**: 4001 (external), 3001 (internal)
- **Purpose**: Decentralized exchange platform
- **Features**:
  - Token swapping
  - Order management
  - Portfolio tracking
- **API Integration**: All operations via Unified API

#### Wallet Web (`apps/wallet`)
- **Technology**: Next.js 14, TypeScript, Ethers.js
- **Port**: 4020 (external), 4020 (internal)
- **Purpose**: Web-based cryptocurrency wallet
- **Features**:
  - Wallet creation/import
  - Send/receive transactions
  - Transaction history
- **API Integration**: Uses Unified API for account data

#### Documentation (`apps/docs`)
- **Technology**: Nextra (Next.js)
- **Port**: 4011 (external), 3011 (internal)
- **Purpose**: Developer and user documentation
- **Features**:
  - API documentation
  - Architecture guides
  - Setup instructions

### 3.2 Mobile Applications

#### Android Wallet (`apps/wallet-android`)
- **Technology**: Kotlin, Jetpack Compose
- **Purpose**: Native Android wallet application
- **Features**:
  - Wallet management
  - Transaction signing
  - Biometric authentication
- **API Integration**: Uses `ApiClient.kt` to connect to Unified API
- **Native Core**: Rust library via JNI

#### iOS Wallet (`apps/wallet-ios`)
- **Technology**: Swift, SwiftUI
- **Purpose**: Native iOS wallet application
- **Features**:
  - Wallet management
  - Transaction signing
  - Keychain integration
- **API Integration**: Uses `ApiClient.swift` to connect to Unified API
- **Native Core**: Rust library via Swift Package Manager

### 3.3 Unified API (`apps/api`)

#### Technology Stack
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL 14
- **Cache**: Redis 7
- **Authentication**: JWT

#### Ports
- **External**: 4000 (for frontend access)
- **Internal**: 3000 (for Docker networking)

#### Modules
- **Explorer Module**: Block, transaction, account endpoints
- **Exchange Module**: Swap, orders, prices endpoints
- **Wallet Module**: Account, balance, transaction endpoints
- **Auth Module**: Authentication and authorization
- **Cache Module**: Redis caching layer

#### Key Features
- REST API (50+ endpoints)
- WebSocket support for real-time updates
- JWT authentication
- Rate limiting
- Request/response logging
- Error handling
- Health checks

### 3.4 Data Layer

#### PostgreSQL (`postgres`)
- **Port**: 5433 (external), 5432 (internal)
- **Purpose**: Primary database
- **Schema**:
  - `blocks` - Block data
  - `transactions` - Transaction data
  - `accounts` - Account information
  - `orders` - Exchange orders
  - `trades` - Trade history
  - `wallets` - Wallet metadata (encrypted)

#### Redis (`redis`)
- **Port**: 6380 (external), 6379 (internal)
- **Purpose**: Caching and session storage
- **Usage**:
  - API response caching
  - Rate limiting counters
  - Session storage
  - Real-time data cache

### 3.5 External Services

#### NorChain RPC Node
- **URL**: `https://rpc.norchain.org`
- **Purpose**: Blockchain queries and transaction broadcasting
- **Protocol**: JSON-RPC over HTTP/WebSocket
- **Usage**: All blockchain operations

---

## 4. Data Flow

### 4.1 User Request Flow

```
User → Frontend App → Unified API → Database/Cache/RPC → Response
```

#### Example: Get Account Balance

1. **User** opens wallet app and views balance
2. **Frontend** calls `GET /api/v1/account/{address}/balance`
3. **Unified API** receives request
4. **API** checks Redis cache for balance
5. **If cached**: Return cached value
6. **If not cached**: Query PostgreSQL or RPC node
7. **API** caches result in Redis
8. **API** returns balance to frontend
9. **Frontend** displays balance to user

### 4.2 Real-Time Updates Flow

```
RPC Node → WebSocket → Unified API → WebSocket → Frontend
```

#### Example: New Block Notification

1. **RPC Node** emits new block event
2. **Unified API** WebSocket receives event
3. **API** processes block data
4. **API** stores in PostgreSQL
5. **API** updates Redis cache
6. **API** broadcasts to connected WebSocket clients
7. **Frontend** receives update and refreshes UI

### 4.3 Transaction Flow

```
User → Frontend → Wallet Signing → Unified API → RPC Node → Blockchain
```

#### Example: Send Transaction

1. **User** initiates send transaction in wallet
2. **Frontend** prepares transaction data
3. **Wallet** signs transaction with private key
4. **Frontend** sends signed transaction to API
5. **Unified API** validates transaction
6. **API** broadcasts to RPC node
7. **RPC Node** submits to blockchain
8. **API** stores transaction in database
9. **API** notifies frontend of status
10. **Frontend** updates UI with transaction status

---

## 5. Network Architecture

### 5.1 Docker Network

All services run in a Docker bridge network (`norchain-network`):

```
┌─────────────────────────────────────────┐
│      Docker Network (bridge)            │
│                                          │
│  ┌──────────┐  ┌──────────┐            │
│  │   API    │  │ Postgres │            │
│  │ :3000    │  │  :5432   │            │
│  └────┬─────┘  └────┬─────┘            │
│       │             │                   │
│  ┌────▼─────────────▼─────┐            │
│  │    Frontend Apps        │            │
│  │  Explorer, Landing, etc │            │
│  └─────────────────────────┘            │
└─────────────────────────────────────────┘
```

### 5.2 Port Mapping

| Service | Internal Port | External Port | Protocol |
|---------|--------------|---------------|----------|
| Unified API | 3000 | 4000 | HTTP/WS |
| Explorer | 3002 | 4002 | HTTP |
| Landing | 3010 | 4010 | HTTP |
| NEX Exchange | 3001 | 4001 | HTTP |
| Wallet Web | 4020 | 4020 | HTTP |
| Documentation | 3011 | 4011 | HTTP |
| PostgreSQL | 5432 | 5433 | TCP |
| Redis | 6379 | 6380 | TCP |

### 5.3 Communication Patterns

#### Internal Communication (Docker)
- Services use service names: `http://api:3000`
- Direct database access: `postgres:5432`
- Direct cache access: `redis:6379`

#### External Communication (Host)
- Services exposed on host ports: `http://localhost:4000`
- Frontend apps connect via external ports
- Mobile apps connect via external API URL

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
User → Frontend → API → JWT Token → Authorized Request
```

1. **User** authenticates (if required)
2. **API** validates credentials
3. **API** issues JWT token
4. **Frontend** stores token securely
5. **Frontend** includes token in API requests
6. **API** validates token on each request

### 6.2 Security Layers

#### Network Security
- **TLS/SSL**: All external connections encrypted
- **CORS**: Configured for allowed origins
- **Rate Limiting**: Prevents abuse
- **Firewall**: Network isolation

#### Application Security
- **Input Validation**: All inputs validated
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Content sanitization
- **CSRF Protection**: Token-based protection

#### Data Security
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: TLS for all connections
- **Key Management**: Secure key storage
- **Password Hashing**: bcrypt/argon2

### 6.3 Wallet Security

#### Key Storage
- **Web**: Encrypted localStorage (browser)
- **Android**: Android Keystore
- **iOS**: iOS Keychain
- **Never transmitted**: Private keys never leave device

#### Transaction Signing
- **Client-side**: All signing happens on device
- **No key exposure**: Keys never sent to API
- **Secure RPC**: Encrypted connection to RPC node

---

## 7. Deployment Architecture

### 7.1 Development Environment

```
┌─────────────────────────────────────┐
│     Development Machine              │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Docker Compose (Dev)         │  │
│  │  - PostgreSQL                 │  │
│  │  - Redis                      │  │
│  │  - API (with hot reload)      │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Local Development            │  │
│  │  - Frontend apps (npm run dev)│  │
│  │  - Mobile apps (native)       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 7.2 Production Environment

```
┌─────────────────────────────────────────────┐
│           Production Server                  │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │  Load Balancer / Reverse Proxy        │  │
│  │  (Nginx / Traefik)                    │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │  Docker Compose (Production)          │  │
│  │                                       │  │
│  │  ┌──────────┐  ┌──────────┐         │  │
│  │  │   API    │  │   API    │         │  │
│  │  │ (Node 1) │  │ (Node 2) │         │  │
│  │  └──────────┘  └──────────┘         │  │
│  │                                       │  │
│  │  ┌──────────┐  ┌──────────┐         │  │
│  │  │Frontend 1│  │Frontend 2│         │  │
│  │  └──────────┘  └──────────┘         │  │
│  │                                       │  │
│  │  ┌──────────┐  ┌──────────┐         │  │
│  │  │PostgreSQL│  │  Redis   │         │  │
│  │  │(Primary) │  │(Cluster) │         │  │
│  │  └──────────┘  └──────────┘         │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 7.3 Scaling Strategy

#### Horizontal Scaling
- **API**: Multiple instances behind load balancer
- **Frontend**: Multiple instances for high traffic
- **Database**: Read replicas for read scaling
- **Cache**: Redis cluster for distributed caching

#### Vertical Scaling
- **Database**: Increase resources for larger datasets
- **API**: Increase memory/CPU for processing
- **Cache**: Increase memory for larger cache

---

## 8. Integration Points

### 8.1 API Integration

All frontend applications integrate with Unified API:

```typescript
// Example: API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// All apps use similar pattern
fetch(`${API_BASE_URL}/api/v1/endpoint`)
```

### 8.2 Database Integration

Only Unified API connects to database:

```
Frontend Apps → Unified API → PostgreSQL
```

No direct database access from frontend applications.

### 8.3 Cache Integration

Unified API uses Redis for caching:

```
API Request → Check Redis → If miss, query DB → Cache result → Return
```

### 8.4 RPC Integration

Unified API connects to NorChain RPC:

```
API → RPC Node → Blockchain
```

Frontend apps can also connect directly for wallet operations.

---

## 9. Monitoring & Observability

### 9.1 Health Checks

All services have health check endpoints:
- **API**: `/api/v1/health`
- **Frontend Apps**: `/api/health` or `/`
- **Database**: PostgreSQL health check
- **Cache**: Redis ping

### 9.2 Logging

- **API**: Structured logging (Winston/Pino)
- **Frontend**: Console logging + error tracking
- **Docker**: Container logs via `docker-compose logs`

### 9.3 Metrics

- **API Response Times**: Tracked per endpoint
- **Error Rates**: Monitored for anomalies
- **Database Performance**: Query time tracking
- **Cache Hit Rates**: Redis cache effectiveness

---

## 10. Future Architecture Considerations

### 10.1 Planned Enhancements
- **GraphQL API**: Alternative to REST
- **Event Sourcing**: For audit trail
- **Message Queue**: For async processing
- **CDN**: For static asset delivery

### 10.2 Scalability Improvements
- **Microservices Split**: Separate API services
- **Database Sharding**: For large datasets
- **Caching Strategy**: Multi-layer caching
- **Edge Computing**: CDN edge functions

---

## Appendix

### A. Technology Versions
- Node.js: 18+
- Next.js: 14.0
- NestJS: 10.0
- PostgreSQL: 14
- Redis: 7
- Docker: 20.10+

### B. API Endpoints Reference
See [API Documentation](../development/API_RENAME_COMPLETE.md) for complete endpoint list.

### C. Database Schema
See [Database Architecture](./SHARED_DATABASE.md) for schema details.

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Maintained By**: NorChain Development Team

