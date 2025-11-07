# Project Structure

```
norchain-explorer-api/
├── src/                          # Source code
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts            # Root module
│   ├── common/                  # Shared utilities
│   │   ├── decorators/         # Custom decorators (@Public, @Roles)
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards (JWT, Roles)
│   │   ├── interceptors/       # Request/response interceptors
│   │   ├── interfaces/         # TypeScript interfaces
│   │   ├── pipes/              # Validation pipes
│   │   ├── repositories/       # Base repository pattern
│   │   └── services/           # Shared services (Cache, RPC)
│   ├── config/                  # Configuration
│   │   ├── config.schema.ts    # Config validation
│   │   ├── database.config.ts  # Database configuration
│   │   └── supabase.config.ts  # Supabase configuration
│   └── modules/                 # Feature modules
│       ├── auth/               # Authentication
│       │   ├── dto/           # Data Transfer Objects
│       │   ├── entities/      # TypeORM entities
│       │   ├── strategies/    # Passport strategies (JWT, API Key)
│       │   ├── auth.service.ts
│       │   ├── auth.controller.ts
│       │   └── auth.module.ts
│       ├── account/            # Account operations
│       ├── transaction/        # Transactions
│       ├── block/              # Blocks
│       ├── token/              # Tokens
│       ├── contract/           # Contracts
│       ├── stats/              # Statistics
│       ├── health/             # Health checks
│       ├── websocket/          # WebSocket gateway
│       ├── supabase/           # Supabase integration
│       └── notifications/      # Notifications system
├── docs/                        # Nextra documentation site
│   ├── pages/                  # Documentation pages (MDX)
│   ├── theme.config.tsx        # Theme configuration
│   ├── next.config.js         # Next.js configuration
│   └── package.json           # Docs dependencies
├── test/                        # Tests
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # E2E tests
├── scripts/                     # Utility scripts
│   └── generate-docs.js       # Documentation generator
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── nest-cli.json              # NestJS CLI configuration
├── README.md                  # Main README
├── ARCHITECTURE.md            # Architecture documentation
├── REALTIME_SETUP.md          # Real-time setup guide
└── MIGRATION_GUIDE.md         # Migration guide
```

## Key Directories

### `src/common/`
Shared utilities used across all modules:
- **Decorators**: `@Public()`, `@Roles()`
- **Guards**: Authentication and authorization
- **Interceptors**: Logging, transformation
- **Services**: Cache, RPC, etc.

### `src/modules/`
Feature modules following NestJS conventions:
- Each module is self-contained
- Has its own controller, service, entities, DTOs
- Can be easily added/removed

### `docs/`
Nextra-based documentation site:
- Markdown/MDX pages
- Auto-generated navigation
- Search functionality
- Dark mode support

## Module Structure

Each module follows this pattern:

```
module-name/
├── dto/              # Data Transfer Objects (validation)
├── entities/         # TypeORM entities (database)
├── repositories/     # Data access layer (optional)
├── services/         # Business logic
├── controllers/      # HTTP endpoints
└── module.ts         # Module definition
```

## Configuration Files

- **`.env`** - Environment variables (not in repo)
- **`tsconfig.json`** - TypeScript compiler options
- **`nest-cli.json`** - NestJS CLI configuration
- **`.eslintrc.js`** - ESLint rules
- **`.prettierrc`** - Prettier formatting

## Build Output

- **`dist/`** - Compiled JavaScript (generated)
- **`.next/`** - Next.js build output (docs)
- **`coverage/`** - Test coverage reports

---

**Well-organized and ready for development!** 🚀

