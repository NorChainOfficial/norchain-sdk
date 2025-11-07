# XaheenExplorer GraphQL API

Production-grade GraphQL API that beats REST with advanced features like DataLoader optimization, subscriptions, and comprehensive type safety.

## 🚀 Features

- **Type-Safe Schema**: Comprehensive GraphQL schema with custom scalars
- **DataLoader Optimization**: Efficient batch loading prevents N+1 queries
- **Real-time Subscriptions**: WebSocket support for live updates
- **Rate Limiting**: Tiered rate limits (free: 100/min, premium: 1k/min, enterprise: 10k/min)
- **Authentication**: API key-based authentication
- **Caching**: Intelligent Apollo Client caching with merge strategies
- **Error Handling**: Production-ready error formatting
- **Auto-Generated Types**: Full TypeScript support

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Rate Limits](#rate-limits)
- [Query Examples](#query-examples)
- [Subscriptions](#subscriptions)
- [Client SDK](#client-sdk)
- [Advanced Usage](#advanced-usage)
- [Error Handling](#error-handling)

## 🎯 Quick Start

### 1. Access GraphQL Playground

Visit: `http://localhost:3002/api/graphql`

### 2. Make Your First Query

```graphql
query {
  latestBlocks(limit: 5) {
    height
    hash
    timestamp
    transactionCount
  }
}
```

### 3. Use with TypeScript Client

```typescript
import { graphqlClient, GET_LATEST_BLOCKS } from '@/lib/graphql';

const { data } = await graphqlClient.query({
  query: GET_LATEST_BLOCKS,
  variables: { limit: 5 },
});
```

## 🔐 Authentication

### API Keys

Include your API key in the request header:

```bash
curl -X POST http://localhost:3002/api/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: xaheen_premium_YOUR_KEY" \
  -d '{"query": "{ health }"}'
```

### Tiers

- **Free**: `xaheen_` prefix (100 req/min)
- **Premium**: `xaheen_premium_` prefix (1000 req/min)
- **Enterprise**: `xaheen_enterprise_` prefix (10000 req/min)

## ⚡ Rate Limits

| Tier | Rate Limit | Window |
|------|------------|--------|
| Free | 100 requests | 1 minute |
| Premium | 1,000 requests | 1 minute |
| Enterprise | 10,000 requests | 1 minute |

Rate limit exceeded responses:

```json
{
  "errors": [{
    "message": "Rate limit exceeded. Please try again later.",
    "extensions": {
      "code": "RATE_LIMIT_EXCEEDED"
    }
  }]
}
```

## 📊 Query Examples

### Get Block by Height

```graphql
query GetBlock($height: Int!) {
  block(height: $height) {
    height
    hash
    timestamp
    transactionCount
    proposer {
      address
      balance
    }
    transactions(first: 10) {
      edges {
        node {
          hash
          sender
          receiver
          amount
          status
        }
      }
      pageInfo {
        hasNextPage
      }
    }
    stats {
      avgGasPrice
      totalFees
      successRate
    }
  }
}
```

Variables:
```json
{
  "height": 12345
}
```

### Get Transaction Details

```graphql
query GetTransaction($hash: Hash!) {
  transaction(hash: $hash) {
    hash
    blockHeight
    timestamp
    sender
    receiver
    amount
    fee
    status
    block {
      height
      timestamp
    }
    events {
      eventName
      decodedParams {
        name
        type
        value
      }
    }
    decodedData {
      methodName
      params {
        name
        type
        value
      }
    }
  }
}
```

### Get Account with Analytics

```graphql
query GetAccount($address: Address!) {
  account(address: $address) {
    address
    balance
    stakedBalance
    txCount
    type
    analytics {
      totalSent
      totalReceived
      avgTransactionValue
      uniqueCounterparties
    }
    balanceHistory(interval: "1d") {
      timestamp
      balance
      blockHeight
    }
  }
}
```

### Paginated Blocks

```graphql
query GetBlocks($first: Int!, $after: String) {
  blocks(first: $first, after: $after) {
    edges {
      cursor
      node {
        height
        hash
        timestamp
        transactionCount
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### Search

```graphql
query Search($query: String!) {
  search(query: $query) {
    type
    result {
      ... on Block {
        height
        hash
        timestamp
      }
      ... on Transaction {
        hash
        sender
        receiver
        amount
      }
      ... on Account {
        address
        balance
        type
      }
    }
  }
}
```

### Network Statistics

```graphql
query GetStats {
  stats {
    totalBlocks
    totalTransactions
    totalAccounts
    blocks24h
    transactions24h
    avgBlockTime
    chartData {
      blocks {
        timestamp
        value
      }
      transactions {
        timestamp
        value
      }
    }
  }
}
```

## 🔔 Subscriptions

### Subscribe to New Blocks

```typescript
import { subscribeToQuery, SUBSCRIBE_NEW_BLOCK } from '@/lib/graphql';

const unsubscribe = subscribeToQuery(
  SUBSCRIBE_NEW_BLOCK,
  {},
  {
    onData: (data) => {
      console.log('New block:', data.newBlock);
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    },
  }
);

// Cleanup
unsubscribe();
```

### Subscribe to New Transactions

```typescript
subscribeToQuery(
  SUBSCRIBE_NEW_TRANSACTION,
  {},
  {
    onData: ({ newTransaction }) => {
      console.log('New transaction:', newTransaction.hash);
    },
  }
);
```

### Subscribe to Account Activity

```typescript
subscribeToQuery(
  SUBSCRIBE_ACCOUNT_ACTIVITY,
  { address: '0x1234...' },
  {
    onData: ({ accountActivity }) => {
      console.log('Account activity:', accountActivity);
    },
  }
);
```

### Subscribe to Contract Events

```typescript
subscribeToQuery(
  SUBSCRIBE_CONTRACT_EVENTS,
  {
    address: '0xabcd...',
    eventName: 'Transfer'
  },
  {
    onData: ({ contractEvents }) => {
      console.log('Contract event:', contractEvents);
    },
  }
);
```

## 💻 Client SDK

### Installation

The client SDK is included in the project. Import from `@/lib/graphql`.

### Basic Usage

```typescript
import { graphqlClient, GET_BLOCK } from '@/lib/graphql';

// Query with caching
const { data } = await graphqlClient.query({
  query: GET_BLOCK,
  variables: { height: 12345 },
});

console.log(data.block);
```

### With API Key

```typescript
import { createGraphQLClient, GET_ACCOUNT } from '@/lib/graphql';

const client = createGraphQLClient('xaheen_premium_YOUR_KEY');

const { data } = await client.query({
  query: GET_ACCOUNT,
  variables: { address: '0x1234...' },
});
```

### Execute Query Helper

```typescript
import { executeQuery, GET_TRANSACTION } from '@/lib/graphql';

const data = await executeQuery(
  GET_TRANSACTION,
  { hash: '0xabcd...' },
  {
    apiKey: 'xaheen_premium_YOUR_KEY',
    cachePolicy: 'network-only',
  }
);
```

### React Hook Integration

```typescript
import { useQuery } from '@apollo/client';
import { GET_LATEST_BLOCKS } from '@/lib/graphql/queries';

function LatestBlocks() {
  const { data, loading, error } = useQuery(GET_LATEST_BLOCKS, {
    variables: { limit: 10 },
    pollInterval: 3000, // Poll every 3 seconds
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.latestBlocks.map(block => (
        <div key={block.height}>{block.height}</div>
      ))}
    </div>
  );
}
```

## 🔧 Advanced Usage

### Custom Caching

```typescript
import { InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
  typePolicies: {
    Account: {
      fields: {
        balance: {
          read(existing, { readField }) {
            // Custom cache read logic
            return existing;
          },
        },
      },
    },
  },
});
```

### Pagination

```typescript
const { data, fetchMore } = useQuery(GET_BLOCKS, {
  variables: { first: 20 },
});

// Load more
await fetchMore({
  variables: {
    after: data.blocks.pageInfo.endCursor,
  },
});
```

### Optimistic Updates

```typescript
await client.mutate({
  mutation: SOME_MUTATION,
  optimisticResponse: {
    // Optimistic data
  },
  update: (cache, { data }) => {
    // Update cache
  },
});
```

## ❌ Error Handling

### Error Codes

- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `UNAUTHENTICATED`: Invalid API key
- `BAD_USER_INPUT`: Invalid input parameters
- `INTERNAL_SERVER_ERROR`: Server error

### Error Response Format

```json
{
  "errors": [{
    "message": "Block not found",
    "path": ["block"],
    "extensions": {
      "code": "NOT_FOUND"
    }
  }]
}
```

### Handling Errors in Client

```typescript
try {
  const data = await executeQuery(GET_BLOCK, { height: 99999999 });
} catch (error) {
  if (error.message.includes('Rate limit')) {
    console.log('Rate limited, retry later');
  } else if (error.message.includes('not found')) {
    console.log('Block does not exist');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🎨 Schema Overview

### Core Types

- **Block**: Blockchain blocks with proposer and transactions
- **Transaction**: Transactions with decoded data and events
- **Account**: Accounts with balance history and analytics
- **Contract**: Smart contracts with source code and ABI
- **Token**: ERC20/721/1155 tokens with holders
- **Validator**: Network validators with voting power

### Custom Scalars

- `DateTime`: ISO 8601 date-time strings
- `BigInt`: Large integers (balances, gas, etc.)
- `Address`: Blockchain addresses
- `Hash`: Transaction/block hashes

### Pagination

All paginated fields use Relay-style cursor pagination:

```graphql
type Connection {
  edges: [Edge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type Edge {
  cursor: String!
  node: NodeType!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

## 🚀 Performance

### DataLoader Benefits

- **Batching**: Multiple requests batched into single RPC call
- **Caching**: Per-request caching prevents duplicate loads
- **N+1 Prevention**: Efficient nested queries

### Example Performance

Without DataLoader (N+1 problem):
```
1 query for 10 blocks = 1 RPC call
10 queries for block proposers = 10 RPC calls
Total: 11 RPC calls
```

With DataLoader:
```
1 query for 10 blocks = 1 RPC call
10 proposer loads = 1 batched RPC call
Total: 2 RPC calls
```

## 📈 Monitoring

### Request Logging

All requests are logged with:
- Request ID
- Operation name
- Duration
- API key tier
- Errors

### Cache Performance

Monitor cache hit rates in Apollo Client DevTools (development mode).

## 🔒 Security

- **API Key Validation**: All requests validated against API key database
- **Rate Limiting**: Per-key rate limiting prevents abuse
- **Error Sanitization**: Internal errors hidden in production
- **Query Complexity**: Future: Query complexity analysis to prevent expensive queries

## 📚 Resources

- [GraphQL Official Docs](https://graphql.org/)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [DataLoader Pattern](https://github.com/graphql/dataloader)
- [Relay Pagination](https://relay.dev/graphql/connections.htm)

## 🐛 Troubleshooting

### Introspection Disabled in Production

Enable introspection:
```typescript
const server = new ApolloServer({
  introspection: true,
  // ...
});
```

### CORS Issues

Configure CORS in Next.js:
```typescript
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
    },
  });
}
```

### Rate Limit Too Low

Upgrade your API key tier or implement request batching.

## 📝 License

MIT License - See LICENSE file for details
