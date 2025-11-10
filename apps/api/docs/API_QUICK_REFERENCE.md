# NorChain API - Quick Reference Guide

## 🔗 Key Endpoints

### Health & Status
- `GET /api/health` - Health check
- `GET /api/monitoring/health` - System health metrics
- `GET /api/monitoring/performance` - Performance statistics

### GraphQL
- `POST /api/graphql` - GraphQL endpoint
- `GET /api/graphql` - GraphQL Playground

### Analytics
- `GET /api/analytics/network` - Network analytics
- `GET /api/analytics/user` - User analytics (auth required)
- `GET /api/analytics/realtime` - Real-time metrics

### Cache Management
- `GET /api/cache/metrics` - Cache performance metrics
- `POST /api/cache/invalidate` - Invalidate cache by pattern (auth required)
- `POST /api/cache/reset-metrics` - Reset cache metrics (auth required)

### Metadata
- `POST /api/v2/metadata/challenges` - Create ownership challenge
- `POST /api/v2/metadata/profiles` - Submit/update profile
- `GET /api/v2/metadata/profiles/{chainId}/{address}` - Get profile
- `POST /api/v2/metadata/media` - Upload logo/banner

### Documentation
- `GET /api-docs` - Swagger/OpenAPI documentation

---

## 🔐 Authentication

### JWT Token
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.norchain.org/api/wallet
```

### API Key
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  https://api.norchain.org/api/account/balance?address=0x...
```

---

## 📡 GraphQL Subscriptions

### Subscribe to Blocks
```graphql
subscription {
  blockAdded {
    hash
    number
    timestamp
    gasUsed
    gasLimit
  }
}
```

### Subscribe to Transactions
```graphql
subscription {
  transactionAdded(address: "0x...") {
    hash
    from
    to
    value
    status
  }
}
```

### Subscribe to Policy Checks
```graphql
subscription {
  policyCheck {
    status
    allowed
    riskScore
    auditHash
  }
}
```

---

## 🎯 Common Use Cases

### Get Account Balance
```bash
GET /api/account/balance?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

### Get Transaction
```bash
GET /api/transaction/{hash}
```

### Get Block
```bash
GET /api/block/{number}
```

### Upload Metadata Media
```bash
POST /api/v2/metadata/media
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: {file}
kind: logo|banner
```

---

## 📊 Response Headers

### Standard Headers
- `X-Total-Count` - Total items (pagination)
- `X-Limit` - Items per page
- `X-Offset` - Current offset
- `X-Has-More` - More items available
- `X-RateLimit-Limit` - Rate limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset time

### Multi-Region Headers
- `X-Region` - Current region
- `X-Available-Regions` - Available regions

### Idempotency Headers
- `Idempotency-Key` - Request idempotency key (required for write operations)
- `Idempotency-Replay` - Indicates cached response replay

---

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=norchain

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# IPFS (optional)
IPFS_PROVIDER=none
IPFS_API_KEY=
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Multi-Region
REGION=us-east-1
REGIONS=[{"name":"us-east-1","endpoint":"https://api-us.norchain.org","priority":1,"enabled":true}]

# API
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

---

## 📚 Documentation

- Swagger: `http://localhost:3000/api-docs`
- GraphQL Playground: `http://localhost:3000/api/graphql`
- Complete API Status: `docs/COMPLETE_API_STATUS.md`
- Implementation Report: `docs/FINAL_IMPLEMENTATION_REPORT.md`

---

**Last Updated**: January 2025

