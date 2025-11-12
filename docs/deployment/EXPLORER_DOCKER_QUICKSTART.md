# Explorer Docker Quick Start Guide

**Quick reference for testing Explorer via Docker**

---

## 🚀 Quick Commands

### Start Services
```bash
./scripts/start-docker-services.sh
```

### Run Tests
```bash
./scripts/docker-test-explorer.sh
```

### View Logs
```bash
docker-compose logs -f api explorer
```

### Stop Services
```bash
docker-compose down
```

---

## 📋 Manual Testing

### Test API Endpoints
```bash
# Stats
curl http://localhost:4000/api/v1/stats

# Blocks
curl "http://localhost:4000/api/v1/blocks?page=1&per_page=5"

# Transactions
curl "http://localhost:4000/api/v1/transactions?page=1&limit=5"

# Accounts
curl "http://localhost:4000/api/v1/accounts?page=1&per_page=5"
```

### Test Explorer Pages
```bash
# Homepage
curl http://localhost:4002

# Blocks
curl http://localhost:4002/blocks

# Transactions
curl http://localhost:4002/transactions

# Accounts
curl http://localhost:4002/accounts
```

---

## 🔍 Quick Debugging

### Check Status
```bash
docker-compose ps
```

### Check Logs
```bash
docker-compose logs api | tail -50
docker-compose logs explorer | tail -50
```

### Restart Services
```bash
docker-compose restart api explorer
```

### Rebuild
```bash
docker-compose up -d --build api explorer
```

---

## ✅ Success Indicators

- ✅ API responds at `http://localhost:4000/api/v1/stats`
- ✅ Explorer loads at `http://localhost:4002`
- ✅ No errors in logs
- ✅ Health checks pass

---

**For detailed information, see**: `docs/deployment/DOCKER_EXPLORER_SETUP.md`

