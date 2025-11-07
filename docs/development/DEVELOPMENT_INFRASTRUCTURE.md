# Development Infrastructure Guide
## NorChain Ecosystem

Complete guide for setting up and developing the NorChain ecosystem.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Workflow](#development-workflow)
4. [Project Structure](#project-structure)
5. [Development Tools](#development-tools)
6. [Environment Configuration](#environment-configuration)
7. [Testing](#testing)
8. [Debugging](#debugging)
9. [Common Tasks](#common-tasks)

---

## 1. Prerequisites

### Required Software

#### Core Tools
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Docker**: v20.10 or higher
- **Docker Compose**: v2.0 or higher
- **Git**: Latest version

#### Platform-Specific

**For Web Development:**
- Modern browser (Chrome, Firefox, Safari, Edge)

**For Android Development:**
- **Android Studio**: Latest version
- **JDK**: 17 or higher
- **Android SDK**: API 28+
- **NDK**: For Rust core (optional)

**For iOS Development:**
- **Xcode**: 15.0 or higher
- **macOS**: 13.0 or higher
- **CocoaPods**: Latest version (if needed)
- **Swift**: 5.9+

**For API Development:**
- **PostgreSQL Client**: psql (optional, for direct DB access)
- **Redis Client**: redis-cli (optional, for cache inspection)

### System Requirements

- **RAM**: Minimum 8GB, Recommended 16GB
- **Disk Space**: Minimum 10GB free space
- **OS**: macOS, Linux, or Windows (with WSL2)

---

## 2. Initial Setup

### 2.1 Clone Repository

```bash
git clone <repository-url>
cd norchain-monorepo
```

### 2.2 Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces
```

### 2.3 Environment Configuration

```bash
# Copy environment template
cp ENV_TEMPLATE.md .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

Required environment variables:
```env
# Database
DB_NAME=norchain_explorer
DB_USER=postgres
DB_PASSWORD=postgres

# API
API_PORT=4000
JWT_SECRET=your-secret-key-change-in-production

# Blockchain
RPC_URL=https://rpc.norchain.org
CHAIN_ID=65001
```

### 2.4 Start Infrastructure Services

```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Verify services are running
docker-compose ps
```

### 2.5 Verify Setup

```bash
# Test connectivity
./scripts/test-connectivity.sh

# Check all services
npm run check
```

---

## 3. Development Workflow

### 3.1 Starting Development Servers

#### Option 1: Start All Services
```bash
# Start all services in parallel
npm run dev
```

#### Option 2: Start Individually
```bash
# Start API
npm run api:dev

# Start Explorer
npm run explorer:dev

# Start Landing
npm run landing:dev

# Start NEX Exchange
npm run nex:dev

# Start Wallet Web
npm run wallet:dev

# Start Documentation
npm run docs:dev
```

### 3.2 Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| Unified API | http://localhost:4000 | Backend API |
| API Docs | http://localhost:4000/api-docs | Swagger documentation |
| Explorer | http://localhost:4002 | Blockchain explorer |
| Landing | http://localhost:4010 | Landing page |
| NEX Exchange | http://localhost:4001 | DEX platform |
| Wallet Web | http://localhost:4020 | Web wallet |
| Documentation | http://localhost:4011 | Docs site |

### 3.3 Hot Reload

All Next.js applications support hot reload:
- **Web Apps**: Automatic reload on file changes
- **API**: Restarts on file changes (NestJS watch mode)

### 3.4 Code Organization

```
norchain-monorepo/
├── apps/
│   ├── api/              # Unified API
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules
│   │   │   ├── common/   # Shared utilities
│   │   │   └── main.ts   # Entry point
│   │   └── test/         # Tests
│   ├── explorer/         # Explorer app
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── ...               # Other apps
├── packages/             # Shared packages
└── scripts/             # Build scripts
```

---

## 4. Project Structure

### 4.1 Monorepo Structure

```
norchain-monorepo/
├── apps/                 # Applications
│   ├── api/              # Unified API backend
│   ├── explorer/         # Blockchain explorer
│   ├── landing/          # Landing page
│   ├── nex-exchange/     # DEX platform
│   ├── wallet/           # Wallet web app
│   ├── wallet-android/   # Android wallet
│   ├── wallet-ios/       # iOS wallet
│   └── docs/             # Documentation site
├── packages/             # Shared packages
│   └── wallet-core/      # Shared wallet core
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── docker-compose.yml    # Production Docker
├── docker-compose.dev.yml # Development Docker
└── package.json          # Root package.json
```

### 4.2 Workspace Configuration

Root `package.json` defines workspaces:
```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

### 4.3 Naming Conventions

- **Packages**: `@norchain/{package-name}`
- **Apps**: `@norchain/{app-name}`
- **Files**: kebab-case for files, PascalCase for components
- **Variables**: camelCase for variables, UPPER_CASE for constants

---

## 5. Development Tools

### 5.1 Code Editor Setup

#### VS Code (Recommended)

**Recommended Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Docker
- GitLens

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
```

### 5.2 Git Hooks

**Pre-commit** (optional):
```bash
# Install husky (if using)
npm install --save-dev husky

# Setup pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```

### 5.3 Linting & Formatting

```bash
# Lint all workspaces
npm run lint

# Format code (if Prettier configured)
npm run format
```

---

## 6. Environment Configuration

### 6.1 Environment Files

Each app can have its own `.env.local`:

```
apps/
├── api/
│   └── .env              # API environment variables
├── explorer/
│   └── .env.local        # Explorer environment variables
└── ...
```

### 6.2 Environment Variables

#### Unified API (`apps/api/.env`)
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/norchain_explorer
DB_HOST=postgres
DB_PORT=5432
DB_NAME=norchain_explorer
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# API
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key

# Blockchain
RPC_URL=https://rpc.norchain.org
CHAIN_ID=65001

# CORS
CORS_ORIGIN=http://localhost:4002,http://localhost:4010,http://localhost:4001,http://localhost:4020
```

#### Frontend Apps (`.env.local`)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RPC_URL=https://rpc.norchain.org
NEXT_PUBLIC_CHAIN_ID=65001
```

### 6.3 Environment Variable Priority

1. `.env.local` (highest priority, git-ignored)
2. `.env.development` or `.env.production`
3. `.env` (default values)
4. System environment variables

---

## 7. Testing

### 7.1 Running Tests

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=@norchain/api
npm test --workspace=@norchain/explorer

# Run tests in watch mode
npm test -- --watch
```

### 7.2 Test Structure

```
app/
├── src/
└── test/
    ├── unit/          # Unit tests
    ├── integration/   # Integration tests
    └── e2e/          # End-to-end tests
```

### 7.3 Testing Tools

- **Unit Tests**: Jest, Vitest
- **E2E Tests**: Playwright, Cypress
- **API Tests**: Supertest
- **Component Tests**: React Testing Library

---

## 8. Debugging

### 8.1 API Debugging

```bash
# Start API with debug logging
npm run api:dev

# View API logs
docker-compose logs -f api

# Debug in VS Code
# Add breakpoint in src/main.ts
# Press F5 to start debugging
```

### 8.2 Frontend Debugging

```bash
# Start with debug mode
npm run explorer:dev

# Open browser DevTools
# Chrome: F12 or Cmd+Option+I
# Firefox: F12 or Cmd+Option+I
```

### 8.3 Database Debugging

```bash
# Connect to PostgreSQL
psql -h localhost -p 5433 -U postgres -d norchain_explorer

# View tables
\dt

# Query data
SELECT * FROM blocks LIMIT 10;
```

### 8.4 Redis Debugging

```bash
# Connect to Redis
redis-cli -h localhost -p 6380

# View keys
KEYS *

# Get value
GET <key>
```

---

## 9. Common Tasks

### 9.1 Adding a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Add code**
   - API: Add module in `apps/api/src/modules/`
   - Frontend: Add component/page in app directory

3. **Test locally**
   ```bash
   npm run dev
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### 9.2 Adding a New API Endpoint

1. **Create controller** in `apps/api/src/modules/{module}/`
2. **Add route** in controller
3. **Add service** for business logic
4. **Add DTOs** for request/response
5. **Update Swagger** documentation
6. **Test endpoint** using Swagger UI

### 9.3 Adding a New Frontend Page

1. **Create page** in `app/{route}/page.tsx`
2. **Add components** if needed
3. **Add API calls** using API client
4. **Add styling** with Tailwind CSS
5. **Test** in browser

### 9.4 Database Migrations

```bash
# Create migration (if using migration tool)
npm run migration:create --workspace=@norchain/api

# Run migrations
npm run migration:run --workspace=@norchain/api

# Revert migration
npm run migration:revert --workspace=@norchain/api
```

### 9.5 Building for Production

```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build --workspace=@norchain/api
npm run build --workspace=@norchain/explorer
```

---

## 10. Troubleshooting

### 10.1 Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :4000

# Kill process
kill -9 <PID>

# Or change port in .env
```

#### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL

# Restart PostgreSQL
docker-compose restart postgres
```

#### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf apps/*/.next
```

### 10.2 Getting Help

- **Documentation**: Check `docs/` folder
- **Issues**: Check GitHub issues
- **Logs**: Check `docker-compose logs`
- **Health**: Run `./scripts/test-connectivity.sh`

---

## 11. Best Practices

### 11.1 Code Quality
- Use TypeScript strict mode
- Write tests for new features
- Follow ESLint rules
- Use Prettier for formatting
- Write clear commit messages

### 11.2 Git Workflow
- Create feature branches
- Write descriptive commit messages
- Keep commits atomic
- Review code before merging
- Use conventional commits

### 11.3 API Development
- Follow RESTful conventions
- Document all endpoints
- Validate all inputs
- Handle errors gracefully
- Use appropriate HTTP status codes

### 11.4 Frontend Development
- Use TypeScript
- Component-based architecture
- Reusable components
- Responsive design
- Accessibility (WCAG 2.1)

---

## Appendix

### A. Useful Commands

```bash
# Clean build artifacts
npm run clean

# Check for issues
npm run check

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all services
docker-compose down
```

### B. Resources

- [Architecture Documentation](../architecture/COMPLETE_ARCHITECTURE.md)
- [API Documentation](../development/API_RENAME_COMPLETE.md)
- [Docker Setup](../deployment/DOCKER_SETUP.md)

---

**Last Updated**: November 2024

