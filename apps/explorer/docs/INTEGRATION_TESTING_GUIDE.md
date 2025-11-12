# Explorer API Integration Testing Guide

**Date**: January 2025  
**Status**: Ready for Testing

---

## 🧪 Testing Checklist

### Prerequisites

1. **API Running**: `http://localhost:4000`
2. **Explorer Running**: `http://localhost:3002`
3. **Database**: Connected and accessible
4. **RPC Node**: Connected (if needed for blockchain data)

---

## 📋 Test Cases

### 1. Stats Endpoint ✅

**Endpoint**: `GET /api/v1/stats`

**Expected Response**:
```json
{
  "blockHeight": 12345,
  "totalTransactions": 0,
  "totalAccounts": 0,
  "gasPrice": "1000000000",
  "activeValidators": 5,
  "latest_block": {
    "height": 12345,
    "hash": "",
    "timestamp": "1234567890",
    "transaction_count": 0
  }
}
```

**Test Command**:
```bash
curl http://localhost:4000/api/v1/stats
```

**Explorer Page**: Homepage (`/`)

**What to Check**:
- ✅ Stats display correctly
- ✅ Block height shows
- ✅ Validators count shows
- ✅ Gas price displays

---

### 2. Blocks Endpoint ✅

**Endpoint**: `GET /api/v1/blocks?page=1&per_page=20`

**Expected Response**:
```json
{
  "data": [
    {
      "blockNumber": "12345",
      "timeStamp": "1234567890",
      "blockHash": "0x...",
      "transactionCount": 10
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1,
    "last_page": 1
  }
}
```

**Test Command**:
```bash
curl "http://localhost:4000/api/v1/blocks?page=1&per_page=5"
```

**Explorer Page**: `/blocks`

**What to Check**:
- ✅ Blocks list displays
- ✅ Pagination works
- ✅ Block details show correctly
- ✅ Links to block detail pages work

---

### 3. Block Detail Endpoint ✅

**Endpoint**: `GET /api/v1/blocks/:height`

**Expected Response**:
```json
{
  "blockNumber": "12345",
  "timeStamp": "1234567890",
  "blockHash": "0x...",
  "parentHash": "0x...",
  "gasLimit": "8000000",
  "gasUsed": "5000000",
  "transactions": ["0x...", "0x..."],
  "transactionCount": 10
}
```

**Test Command**:
```bash
curl http://localhost:4000/api/v1/blocks/12345
```

**Explorer Page**: `/blocks/[height]`

**What to Check**:
- ✅ Block details display
- ✅ Transaction list shows
- ✅ Gas information displays
- ✅ Hash values are correct

---

### 4. Transactions Endpoint ✅

**Endpoint**: `GET /api/v1/transactions?page=1&limit=20`

**Expected Response**:
```json
{
  "transactions": [],
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 0,
    "last_page": 1
  }
}
```

**Test Command**:
```bash
curl "http://localhost:4000/api/v1/transactions?page=1&limit=5"
```

**Explorer Page**: `/transactions`

**What to Check**:
- ✅ Transactions list displays (may be empty initially)
- ✅ Pagination works
- ✅ Transaction details show correctly
- ✅ Links to transaction detail pages work

---

### 5. Transaction Detail Endpoint ✅

**Endpoint**: `GET /api/v1/transactions/:hash`

**Expected Response**:
```json
{
  "blockNumber": "12345",
  "timeStamp": "1234567890",
  "hash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "value": "1000000000000000000",
  "gas": "21000",
  "gasPrice": "20000000000",
  "gasUsed": "21000"
}
```

**Test Command**:
```bash
curl http://localhost:4000/api/v1/transactions/0x123...
```

**Explorer Page**: `/transactions/[hash]`

**What to Check**:
- ✅ Transaction details display
- ✅ From/To addresses show
- ✅ Value displays correctly
- ✅ Gas information shows

---

### 6. Accounts Endpoint ✅

**Endpoint**: `GET /api/v1/accounts?page=1&per_page=20`

**Expected Response**:
```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 0,
    "last_page": 1
  }
}
```

**Test Command**:
```bash
curl "http://localhost:4000/api/v1/accounts?page=1&per_page=5"
```

**Explorer Page**: `/accounts`

**What to Check**:
- ✅ Accounts list displays (may be empty initially)
- ✅ Pagination works
- ✅ Links to account detail pages work

---

### 7. Account Detail Endpoint ✅

**Endpoint**: `GET /api/v1/accounts/:address`

**Expected Response**:
```json
{
  "address": "0x...",
  "balance": "1000000000000000000",
  "transaction_count": 5,
  "transactions": []
}
```

**Test Command**:
```bash
curl http://localhost:4000/api/v1/accounts/0x123...
```

**Explorer Page**: `/accounts/[address]`

**What to Check**:
- ✅ Account details display
- ✅ Balance shows correctly
- ✅ Transaction count displays
- ✅ Transaction list shows

---

### 8. Account Transactions Endpoint ✅

**Endpoint**: `GET /api/v1/accounts/:address/transactions?page=1&per_page=20`

**Expected Response**:
```json
{
  "data": [],
  "transactions": [],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 0
  }
}
```

**Test Command**:
```bash
curl "http://localhost:4000/api/v1/accounts/0x123.../transactions?page=1&per_page=5"
```

**Explorer Page**: `/accounts/[address]` (Transactions tab)

**What to Check**:
- ✅ Account transactions list displays
- ✅ Pagination works
- ✅ Transaction details show correctly

---

## 🔍 Error Handling Tests

### 1. Invalid Block Height

**Test**: `GET /api/v1/blocks/999999999`

**Expected**: Should return error or empty result

**Explorer**: Should show error message or fallback UI

---

### 2. Invalid Transaction Hash

**Test**: `GET /api/v1/transactions/invalid`

**Expected**: Should return 404 or error

**Explorer**: Should show error message

---

### 3. Invalid Account Address

**Test**: `GET /api/v1/accounts/invalid`

**Expected**: Should return error or empty result

**Explorer**: Should show error message

---

### 4. API Unavailable

**Test**: Stop API server, try to load Explorer pages

**Expected**: Explorer should show fallback data or error message

**Explorer**: Should gracefully handle API errors

---

## ✅ Success Criteria

### API Endpoints
- ✅ All endpoints return 200 status
- ✅ Response format matches Explorer expectations
- ✅ Pagination works correctly
- ✅ Error handling works

### Explorer Pages
- ✅ Homepage loads with stats
- ✅ Blocks page displays blocks
- ✅ Transactions page displays transactions
- ✅ Accounts page displays accounts
- ✅ Detail pages show correct information
- ✅ Error states display correctly
- ✅ Loading states show appropriately

---

## 🐛 Common Issues & Solutions

### Issue: Empty Data

**Symptom**: Pages show empty lists

**Solution**: 
- Check if RPC node is connected
- Verify database has data
- Check API logs for errors

---

### Issue: CORS Errors

**Symptom**: Browser console shows CORS errors

**Solution**:
- Verify API CORS configuration
- Check `CORS_ORIGIN` environment variable
- Ensure Explorer URL is whitelisted

---

### Issue: Response Format Mismatch

**Symptom**: Data doesn't display correctly

**Solution**:
- Check API response format
- Verify Explorer API client unwrapping logic
- Check browser console for errors

---

### Issue: Pagination Not Working

**Symptom**: Pagination controls don't work

**Solution**:
- Verify pagination parameters in API
- Check Explorer pagination logic
- Verify `meta` object in response

---

## 📊 Performance Testing

### Load Time Targets

- **Homepage**: < 2 seconds
- **Blocks Page**: < 3 seconds
- **Transactions Page**: < 3 seconds
- **Account Detail**: < 2 seconds

### Test Commands

```bash
# Test response times
time curl http://localhost:4000/api/v1/stats
time curl http://localhost:4000/api/v1/blocks?page=1&per_page=20
time curl http://localhost:4000/api/v1/transactions?page=1&limit=20
```

---

## 🚀 Next Steps After Testing

1. **Fix Any Issues Found**
   - Update API endpoints if needed
   - Adjust Explorer API client if needed
   - Fix response format mismatches

2. **Enhance Functionality**
   - Add real pagination with database queries
   - Implement proper filtering
   - Add search functionality

3. **Optimize Performance**
   - Add caching where appropriate
   - Optimize database queries
   - Implement lazy loading

4. **Add Missing Features**
   - Contract endpoints
   - Token endpoints
   - Validator detail pages

---

**Status**: Ready for comprehensive testing! 🧪

