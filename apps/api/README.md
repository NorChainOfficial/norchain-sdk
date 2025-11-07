# Nor Chain Explorer API

Production-ready REST API for Nor Chain blockchain explorer, built with NestJS, TypeScript, and enterprise patterns.

## 🚀 Features

- ✅ **Type-Safe** - Full TypeScript with strict mode
- ✅ **SOLID Principles** - Clean architecture
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **API Key Support** - Alternative authentication
- ✅ **Redis Caching** - High-performance caching
- ✅ **Real-Time** - WebSocket + Supabase support
- ✅ **Rate Limiting** - Built-in throttling
- ✅ **Swagger Docs** - Auto-generated API docs
- ✅ **Nextra Docs** - Beautiful documentation site
- ✅ **Health Checks** - Kubernetes-ready probes

## 📁 Project Structure

```
norchain-explorer-api/
├── src/                    # Source code
│   ├── common/            # Shared utilities
│   ├── config/            # Configuration
│   └── modules/           # Feature modules
│       ├── auth/          # Authentication
│       ├── account/       # Account operations
│       ├── transaction/   # Transactions
│       ├── block/         # Blocks
│       ├── token/         # Tokens
│       ├── contract/      # Contracts
│       ├── stats/         # Statistics
│       ├── websocket/     # WebSocket gateway
│       ├── supabase/      # Supabase integration
│       └── notifications/  # Notifications
├── docs/                  # Nextra documentation site
├── test/                  # Tests
└── package.json
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npm run migration:run

# Start development server
npm run start:dev

# Access Swagger docs
open http://localhost:3000/api-docs

# Start documentation site
npm run docs:dev
```

## 📚 Documentation

- **API Documentation**: http://localhost:3000/api-docs (Swagger)
- **Nextra Docs**: http://localhost:3000/docs (when running docs:dev)
- **Architecture**: See `ARCHITECTURE.md`
- **Real-Time Setup**: See `REALTIME_SETUP.md`

## 🔧 Configuration

See `.env.example` for all configuration options.

### Required

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `RPC_URL`

### Optional

- `USE_SUPABASE` - Enable Supabase for real-time features
- `REDIS_HOST`, `REDIS_PORT` - For caching

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🐳 Docker

```bash
docker-compose up -d
```

## 📦 Deployment

See `PRODUCTION_DEPLOYMENT.md` for deployment instructions.

## 🔗 Related Projects

- **Blockchain Infrastructure**: `/Volumes/Development/sahalat/blockchain-v2`
- **Frontend Explorer**: (if exists)

## 📞 Support

- 📚 [Documentation](https://docs.norchain.org/api)
- 💬 [Discord](https://discord.gg/norchain)
- 📧 [Email](mailto:support@norchain.org)

---

**Built with ❤️ using NestJS, TypeScript, and SOLID principles**
