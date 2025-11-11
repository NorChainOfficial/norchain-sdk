# NorChain Developer Portal

A comprehensive developer portal for managing API keys, monitoring usage, and testing NorChain APIs.

## Features

### 🔑 API Key Management
- Create, revoke, and regenerate API keys
- Set custom rate limits per key
- Restrict keys to specific endpoints
- IP whitelisting support
- Track last used timestamp
- View detailed usage per key

### 📊 Analytics Dashboard
- Real-time request monitoring
- Success rate tracking
- Response time analytics
- Endpoint usage breakdown
- Geographic distribution of requests
- Custom date range filtering
- Error rate monitoring

### 🔗 Webhook Management
- Create and configure webhooks
- Test webhook endpoints
- View delivery logs
- Retry failed deliveries
- Monitor webhook health

### 🎮 API Playground
- Interactive API request builder
- Multi-language code generation (cURL, TypeScript, Python, Go)
- Real-time request/response testing
- Save and share API requests
- Syntax highlighting for responses

### 📚 Documentation Browser
- Integrated API documentation
- Interactive parameter exploration
- Live code examples
- Request/response schemas

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Syntax Highlighting**: react-syntax-highlighter
- **Security**: crypto-js for encryption
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Running NorChain API instance

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Update .env.local with your configuration
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.io

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3004
NEXT_PUBLIC_APP_NAME=NorChain Developer Portal

# Security
API_KEY_ENCRYPTION_SECRET=your-secret-key-here-min-32-chars
SESSION_SECRET=your-session-secret-here

# Rate Limiting
DEFAULT_RATE_LIMIT=1000
DEFAULT_RATE_LIMIT_WINDOW=3600
```

### Development

```bash
# Start development server (port 3004)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Project Structure

```
apps/dev-portal/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout with navigation
│   │   ├── page.tsx             # Dashboard page
│   │   ├── keys/                # API key management
│   │   ├── analytics/           # Usage analytics
│   │   ├── documentation/       # API docs browser
│   │   ├── webhooks/            # Webhook management
│   │   ├── sandbox/             # API playground
│   │   └── settings/            # Account settings
│   ├── components/              # Reusable components
│   │   ├── ApiKeyCard.tsx      # API key display card
│   │   ├── UsageChart.tsx      # Analytics charts
│   │   ├── CodeBlock.tsx       # Syntax highlighted code
│   │   ├── ApiPlayground.tsx   # Interactive API tester
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   │   ├── useApiKeys.ts       # API key management
│   │   ├── useAnalytics.ts     # Analytics data
│   │   └── useWebhooks.ts      # Webhook management
│   ├── lib/                     # Utility functions
│   │   ├── api-client.ts       # API client
│   │   ├── code-generator.ts   # Multi-language code gen
│   │   └── security.ts         # Security utilities
│   ├── types/                   # TypeScript definitions
│   │   ├── api-key.ts
│   │   ├── analytics.ts
│   │   ├── webhook.ts
│   │   └── playground.ts
│   └── store/                   # State management
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## API Key Security

### Generation
- API keys use a secure random generator
- Keys are prefixed with `nrc_` for identification
- 256-bit entropy for cryptographic strength

### Storage
- Keys are hashed with SHA-256 before storage
- Only shown once on creation
- Encrypted in transit with TLS

### Usage
- Include in `X-API-Key` header
- Alternatively, use `Authorization: Bearer <key>`
- Rate limits enforced per key
- IP restrictions supported

Example:
```bash
curl -H "X-API-Key: nrc_your_api_key" \
  https://api.norchain.io/api/v1/account/balance?address=0x...
```

## Code Generation

The Developer Portal automatically generates code examples in multiple languages:

### TypeScript
```typescript
import { NorChainSDK } from '@norchain/sdk';

const sdk = new NorChainSDK({
  apiKey: 'your-api-key-here'
});

const balance = await sdk.account.getBalance('0x...');
```

### Python
```python
import requests

headers = {
    'X-API-Key': 'your-api-key-here'
}

response = requests.get(
    'https://api.norchain.io/api/v1/account/balance',
    headers=headers,
    params={'address': '0x...'}
)
```

### cURL
```bash
curl -H "X-API-Key: your-api-key-here" \
  "https://api.norchain.io/api/v1/account/balance?address=0x..."
```

## Webhooks

### Configuration
1. Create webhook endpoint in your application
2. Add webhook URL in Developer Portal
3. Select events to subscribe to
4. Save webhook secret for signature verification

### Signature Verification

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}
```

### Event Types
- `transaction.created` - New transaction detected
- `transaction.confirmed` - Transaction confirmed
- `transaction.failed` - Transaction failed
- `block.created` - New block mined
- `token.transfer` - Token transfer detected
- `contract.deployed` - Smart contract deployed
- `wallet.created` - New wallet created

## Rate Limiting

### Default Limits
- **Public (no auth)**: 100 requests/minute
- **Authenticated**: 1,000 requests/minute
- **Premium**: 10,000 requests/minute

### Custom Limits
Set per-key rate limits when creating API keys:

```typescript
const apiKey = await createApiKey({
  name: 'My API Key',
  rateLimit: 5000,
  rateLimitWindow: 3600, // seconds
});
```

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Accessibility

All components follow WCAG AA accessibility standards:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Performance

- Server-side rendering with Next.js App Router
- Optimized image loading
- Code splitting and lazy loading
- Edge runtime compatibility
- Lighthouse score > 90

## Security Features

- TypeScript strict mode for type safety
- API key encryption at rest
- Secure HTTP headers
- CSRF protection
- XSS prevention
- Input validation
- Rate limiting
- IP whitelisting

## Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel

# Production deployment
vercel --prod
```

### Docker

```bash
# Build Docker image
docker build -t norchain-dev-portal .

# Run container
docker run -p 3004:3004 norchain-dev-portal
```

### Environment Variables

Set these in your deployment platform:

- `NEXT_PUBLIC_API_URL` - NorChain API base URL
- `API_KEY_ENCRYPTION_SECRET` - Secret for encrypting API keys (32+ chars)
- `SESSION_SECRET` - Session encryption secret

## Support

For issues and questions:

- GitHub Issues: [norchain-monorepo/issues](https://github.com/norchain/monorepo/issues)
- Documentation: [docs.norchain.io](https://docs.norchain.io)
- Email: developers@norchain.io

## License

MIT License - see LICENSE file for details
