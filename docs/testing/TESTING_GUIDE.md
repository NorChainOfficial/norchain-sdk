# Testing Guide

## 🧪 Comprehensive Testing Guide for NorChain Services

**Date**: November 2024  
**Status**: Services Deployed and Ready for Testing

---

## ✅ Pre-Testing Checklist

- [x] All services running
- [x] API healthy
- [x] Frontend services accessible
- [x] Database connected
- [x] Supabase connected

---

## 🔍 Service Verification

### 1. API Health Check

```bash
curl http://localhost:4000/api/v1/health
```

**Expected Response**:
```json
{
  "status": "1",
  "message": "OK",
  "result": {
    "status": "ok",
    "info": {
      "database": {"status": "up"},
      "memory_heap": {"status": "up"},
      "memory_rss": {"status": "up"},
      "storage": {"status": "up"}
    }
  }
}
```

### 2. API Documentation

Visit: http://localhost:4000/api-docs

**Expected**: Swagger UI with all API endpoints documented

---

## 📋 API Endpoints Testing

### Blocks Endpoints

#### Get Blocks
```bash
curl http://localhost:4000/api/v1/blocks?limit=10
```

#### Get Block by Hash
```bash
curl http://localhost:4000/api/v1/blocks/{hash}
```

#### Get Block by Number
```bash
curl http://localhost:4000/api/v1/blocks/number/{number}
```

### Transactions Endpoints

#### Get Transactions
```bash
curl http://localhost:4000/api/v1/transactions?limit=10
```

#### Get Transaction by Hash
```bash
curl http://localhost:4000/api/v1/transactions/{hash}
```

#### Get Transactions by Address
```bash
curl http://localhost:4000/api/v1/transactions/address/{address}
```

### Token Endpoints

#### Get Tokens
```bash
curl http://localhost:4000/api/v1/tokens?limit=10
```

#### Get Token by Address
```bash
curl http://localhost:4000/api/v1/tokens/{address}
```

#### Get Token Transfers
```bash
curl http://localhost:4000/api/v1/tokens/{address}/transfers
```

### Stats Endpoints

#### Get Network Stats
```bash
curl http://localhost:4000/api/v1/stats
```

#### Get Analytics
```bash
curl http://localhost:4000/api/v1/analytics/network
```

### Swap Endpoints

#### Get Swap Quote
```bash
curl -X POST http://localhost:4000/api/v1/swap/quote \
  -H "Content-Type: application/json" \
  -d '{
    "tokenIn": "0x...",
    "tokenOut": "0x...",
    "amountIn": "1000000000000000000"
  }'
```

### Orders Endpoints

#### Get Limit Orders
```bash
curl http://localhost:4000/api/v1/orders/limit
```

---

## 🌐 Frontend Services Testing

### Explorer (Port 4002)

**URL**: http://localhost:4002

**Test**:
```bash
curl http://localhost:4002
```

**Expected**: HTTP 200

**Features to Test**:
- [ ] Homepage loads
- [ ] Block explorer works
- [ ] Transaction search works
- [ ] Address lookup works
- [ ] API integration works

### Landing (Port 3001)

**URL**: http://localhost:3001

**Test**:
```bash
curl http://localhost:3001
```

**Expected**: HTTP 200

**Features to Test**:
- [ ] Landing page loads
- [ ] Navigation works
- [ ] Links to other services work

### Wallet (Port 4020)

**URL**: http://localhost:4020

**Test**:
```bash
curl http://localhost:4020
```

**Expected**: HTTP 200

**Features to Test**:
- [ ] Wallet interface loads
- [ ] Connection to API works
- [ ] Supabase integration works

### NEX Exchange (Port 4011)

**URL**: http://localhost:4011

**Test**:
```bash
curl http://localhost:4011
```

**Expected**: HTTP 200

**Features to Test**:
- [ ] Exchange interface loads
- [ ] Swap functionality works
- [ ] Order management works

---

## 🗄️ Database Testing

### PostgreSQL

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d norchain_explorer

# Check tables
\dt

# Check blocks table
SELECT COUNT(*) FROM blocks;

# Check transactions table
SELECT COUNT(*) FROM transactions;
```

### Redis

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Test connection
PING

# Check keys
KEYS *
```

---

## 🔗 Supabase Testing

### Test Connection

```bash
./scripts/test-supabase-connection.sh
```

### Test Real-time Subscriptions

The API should automatically subscribe to:
- Blocks
- Transactions
- Token transfers

Check API logs for subscription confirmations:
```bash
docker-compose logs api | grep -i "subscribed"
```

---

## 🧪 Integration Testing

### Test API → Frontend Integration

1. **Explorer → API**
   - Open Explorer
   - Search for a block
   - Verify API call is made
   - Verify data displays correctly

2. **Wallet → API**
   - Open Wallet
   - Check balance
   - Verify API call is made
   - Verify data displays correctly

3. **NEX Exchange → API**
   - Open NEX Exchange
   - Get swap quote
   - Verify API call is made
   - Verify quote displays correctly

### Test WebSocket Connections

The API provides WebSocket endpoints for real-time updates:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:4000/ws');

// Listen for notifications
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Notification:', data);
};
```

---

## 📊 Performance Testing

### API Response Times

```bash
# Test response time
time curl -s http://localhost:4000/api/v1/health > /dev/null

# Test with load
ab -n 100 -c 10 http://localhost:4000/api/v1/health
```

### Frontend Load Times

Open browser DevTools and check:
- Page load time
- API call response times
- Resource loading times

---

## 🐛 Error Testing

### Test Error Handling

1. **Invalid Block Hash**
   ```bash
   curl http://localhost:4000/api/v1/blocks/invalid-hash
   ```
   **Expected**: 404 or error message

2. **Invalid Transaction Hash**
   ```bash
   curl http://localhost:4000/api/v1/transactions/invalid-hash
   ```
   **Expected**: 404 or error message

3. **Invalid Address**
   ```bash
   curl http://localhost:4000/api/v1/tokens/invalid-address
   ```
   **Expected**: 400 or error message

---

## 📝 Test Results Template

### API Tests

| Endpoint | Method | Status | Response Time | Notes |
|----------|--------|--------|---------------|-------|
| /api/v1/health | GET | ✅ | <100ms | - |
| /api/v1/blocks | GET | ⏳ | - | - |
| /api/v1/transactions | GET | ⏳ | - | - |
| /api/v1/stats | GET | ⏳ | - | - |

### Frontend Tests

| Service | URL | Status | Load Time | Notes |
|---------|-----|--------|-----------|-------|
| Explorer | http://localhost:4002 | ✅ | - | - |
| Landing | http://localhost:3001 | ✅ | - | - |
| Wallet | http://localhost:4020 | ✅ | - | - |
| NEX Exchange | http://localhost:4011 | ✅ | - | - |

---

## 🚀 Next Steps

1. **Run API Tests**
   - Test all endpoints
   - Verify responses
   - Check error handling

2. **Run Frontend Tests**
   - Test all pages
   - Verify API integration
   - Check user interactions

3. **Run Integration Tests**
   - Test service communication
   - Verify data flow
   - Check WebSocket connections

4. **Performance Testing**
   - Measure response times
   - Test under load
   - Optimize if needed

---

**Status**: Ready for Testing ✅  
**All Services**: Running and Accessible ✅

