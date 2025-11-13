# NorStudio

AI-powered smart contract IDE for NorChain - Build, test, and deploy smart contracts with AI assistance.

## Overview

NorStudio is a browser-based IDE that combines the power of Remix with AI assistance to help developers build, test, and deploy smart contracts on NorChain. It provides an intuitive interface for writing Solidity code, compiling contracts, and deploying them to NorChain mainnet or testnet.

### Key Features

- **AI-Powered Generation**: Describe your contract in natural language and let AI generate production-ready Solidity code
- **Security Audits**: Real-time security analysis powered by NorAI to catch vulnerabilities before deployment
- **Instant Compilation**: Fast Solidity compilation with detailed error messages and optimization suggestions
- **Smart Templates**: Start with battle-tested templates for tokens, NFTs, DeFi protocols, and more
- **One-Click Deploy**: Deploy directly to NorChain mainnet or testnet with automatic verification
- **Interactive Testing**: Test your contracts with an intuitive UI generated from your contract ABI

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

From the monorepo root:

```bash
# Install dependencies
npm install

# Run NorStudio in development mode
npm run norstudio:dev
```

Or directly from the norstudio directory:

```bash
cd apps/norstudio
npm install
npm run dev
```

The application will be available at `http://localhost:3003`

### Environment Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Configure environment variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# NorChain RPC Configuration
NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.org
NEXT_PUBLIC_CHAIN_ID=65001

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_TEMPLATES=true
```

## Development

### Available Scripts

- `npm run dev` - Start development server on port 3003
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests with Playwright

### Project Structure

```
apps/norstudio/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── src/
│   ├── components/
│   │   ├── editor/          # Code editor components
│   │   ├── layout/          # Layout components
│   │   ├── ui/              # Reusable UI components
│   │   ├── ide/             # IDE-specific features
│   │   ├── project/         # Project management
│   │   └── ai/              # AI integration
│   ├── lib/
│   │   ├── utils.ts         # Utility functions
│   │   └── api-client.ts    # API integration
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   ├── config/
│   │   └── api.ts           # API configuration
│   └── store/               # Zustand stores
├── tests/
│   ├── setup.ts             # Test setup
│   ├── components/          # Component tests
│   └── e2e/                 # E2E tests
└── public/                  # Static assets
```

## Architecture

NorStudio follows a modular architecture with these key principles:

### Frontend Stack

- **Next.js 14**: App Router for routing and SSR
- **React 18**: Component-based UI
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Monaco Editor**: Code editing
- **Radix UI**: Accessible components
- **React Query**: Data fetching and caching
- **Zustand**: State management

### API Integration

NorStudio connects to the unified NorChain API (`apps/api`) for:

- Contract compilation and deployment
- AI-powered code generation and analysis
- Blockchain data and transactions
- Project storage and management

### AI Features

All AI features are powered by the unified API's AI endpoints:

- `/api/v1/ai/chat` - AI assistant chat
- `/api/v1/ai/audit-contract` - Security auditing
- `/api/v1/ai/generate-contract` - Code generation
- `/api/v1/ai/analyze-transaction` - Transaction analysis

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

The production build is optimized for deployment with:

- Server-side rendering
- Static optimization
- Code splitting
- Image optimization
- Standalone output for Docker

## Deployment

### Docker

The application is configured for standalone output and can be deployed using Docker:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3003
ENV PORT 3003

CMD ["node", "server.js"]
```

### Environment Variables

Ensure all required environment variables are set in production:

- `NEXT_PUBLIC_API_URL` - API endpoint
- `NEXT_PUBLIC_NORCHAIN_RPC` - RPC endpoint
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID

## Contributing

### Development Workflow

1. Create a new branch from `main`
2. Make your changes
3. Write/update tests
4. Run linting and type checking
5. Create a pull request

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Follow the existing component patterns
- Write comprehensive tests
- Document complex logic

## Roadmap

### Phase 1: Core IDE (Current)
- [x] Project scaffolding
- [x] Basic layout and navigation
- [ ] Monaco Editor integration
- [ ] File tree management
- [ ] Code compilation

### Phase 2: AI Integration
- [ ] AI assistant sidebar
- [ ] Natural language to Solidity
- [ ] Code explanation and review
- [ ] Security auditing
- [ ] Test generation

### Phase 3: Blockchain Integration
- [ ] Contract deployment
- [ ] Transaction signing
- [ ] Contract interaction
- [ ] Event log viewer
- [ ] Gas optimization

### Phase 4: Advanced Features
- [ ] Template marketplace
- [ ] Interactive tutorials
- [ ] Collaboration features
- [ ] Version control integration
- [ ] Plugin system

## Support

For support and questions:

- Documentation: `/docs`
- GitHub Issues: [Create an issue](https://github.com/norchain/norchain-monorepo/issues)
- Discord: [Join our community](https://discord.gg/norchain)

## License

Copyright © 2025 NorChain. All rights reserved.
