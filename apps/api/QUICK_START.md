# 🚀 Quick Start Guide

Get your enhanced Nor Chain Explorer API up and running in minutes!

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis (optional, for caching)
- Access to blockchain RPC endpoint

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=norchain_explorer
DB_USER=postgres
DB_PASSWORD=your_password

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Blockchain RPC
RPC_URL=http://localhost:8545

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Setup Database

```bash
# Run migrations
npm run migration:run
```

### 4. Start the Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 5. Verify Installation

Visit the Swagger documentation:
```
http://localhost:3000/api-docs
```

## Quick Test

### Test Account Balance

```bash
curl "http://localhost:3000/api/v1/account/balance?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
```

### Test Block Information

```bash
curl "http://localhost:3000/api/v1/block/getblock?blockno=12345"
```

### Test Authentication

```bash
# Register
curl -X POST "http://localhost:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## API Endpoints Overview

### Public Endpoints (No Auth Required)

- `GET /api/v1/account/balance` - Get account balance
- `GET /api/v1/account/txlist` - Get transactions
- `GET /api/v1/block/getblock` - Get block info
- `GET /api/v1/transaction/gettxinfo` - Get transaction info
- `GET /api/v1/token/tokeninfo` - Get token info
- `GET /api/v1/stats/ethsupply` - Get ETH supply
- `GET /api/v1/gas/gasoracle` - Get gas prices

### Authenticated Endpoints (Require JWT or API Key)

- `GET /api/v1/account/summary` - Account summary
- `POST /api/v1/auth/api-keys` - Create API key
- `GET /api/v1/notifications` - Get notifications

### Batch Operations

- `POST /api/v1/batch/balances` - Get multiple balances
- `POST /api/v1/batch/blocks` - Get multiple blocks

### Analytics

- `GET /api/v1/analytics/portfolio` - Portfolio summary
- `GET /api/v1/analytics/transactions` - Transaction analytics
- `GET /api/v1/analytics/network` - Network statistics

## Docker Setup (Optional)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE norchain_explorer;`

### Redis Connection Issues

- Redis is optional - API will work without it (caching disabled)
- To enable caching, ensure Redis is running

### RPC Connection Issues

- Verify RPC endpoint is accessible
- Check `RPC_URL` in `.env`
- Test RPC endpoint: `curl -X POST $RPC_URL -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`

## Next Steps

1. **Explore Swagger Docs**: Visit `http://localhost:3000/api-docs`
2. **Read Documentation**: Check `API_ENHANCEMENTS.md` and `FINAL_SUMMARY.md`
3. **Test Endpoints**: Use the examples above or Swagger UI
4. **Create API Key**: Register and create an API key for production use

## Support

- **Documentation**: See `docs/` folder
- **API Reference**: `http://localhost:3000/api-docs`
- **Architecture**: See `ARCHITECTURE.md`

---

**Happy coding! 🎉**
