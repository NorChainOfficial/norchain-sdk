# GraphQL API Integration Guide

Complete guide to integrating the XaheenExplorer GraphQL API into your application.

## 🚀 Quick Integration

### 1. Import the Client

```typescript
import { graphqlClient, GET_LATEST_BLOCKS } from '@/lib/graphql';
```

### 2. Make Your First Query

```typescript
const { data } = await graphqlClient.query({
  query: GET_LATEST_BLOCKS,
  variables: { limit: 10 },
});

console.log(data.latestBlocks);
```

### 3. Use in React Component

```typescript
'use client';

import { useQuery } from '@apollo/client';
import { GET_LATEST_BLOCKS } from '@/lib/graphql/queries';

export function LatestBlocksList() {
  const { data, loading, error } = useQuery(GET_LATEST_BLOCKS, {
    variables: { limit: 10 },
    pollInterval: 3000, // Refresh every 3 seconds
  });

  if (loading) return <div>Loading blocks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.latestBlocks.map((block: any) => (
        <div key={block.height}>
          Block #{block.height} - {block.transactionCount} txs
        </div>
      ))}
    </div>
  );
}
```

## 📦 Component Patterns

### Block Explorer Component

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BLOCK } from '@/lib/graphql/queries';

export function BlockExplorer() {
  const [height, setHeight] = useState<number>(0);

  const { data, loading, error, refetch } = useQuery(GET_BLOCK, {
    variables: { height },
    skip: height === 0,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const blockHeight = parseInt(formData.get('height') as string);
    setHeight(blockHeight);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSearch} className="mb-6">
        <input
          name="height"
          type="number"
          placeholder="Enter block height"
          className="h-14 px-4 border-2 rounded-lg"
        />
        <button type="submit" className="h-14 px-6 ml-2 bg-blue-600 text-white rounded-lg">
          Search
        </button>
      </form>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}

      {data?.block && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Block #{data.block.height}</h2>
          <div className="space-y-2">
            <p><strong>Hash:</strong> {data.block.hash}</p>
            <p><strong>Timestamp:</strong> {new Date(data.block.timestamp).toLocaleString()}</p>
            <p><strong>Transactions:</strong> {data.block.transactionCount}</p>
            <p><strong>Gas Used:</strong> {data.block.gasUsed}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Transaction Monitor Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { subscribeToQuery, SUBSCRIBE_NEW_TRANSACTION } from '@/lib/graphql';

export function TransactionMonitor() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToQuery(
      SUBSCRIBE_NEW_TRANSACTION,
      {},
      {
        onData: (data: any) => {
          setTransactions((prev) => [data.newTransaction, ...prev.slice(0, 49)]);
        },
        onError: (error: Error) => {
          console.error('Subscription error:', error);
        },
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Live Transactions</h2>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div key={tx.hash} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between">
              <span className="font-mono text-sm">{tx.hash.slice(0, 10)}...</span>
              <span className="text-green-600">{tx.status}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {tx.sender.slice(0, 10)}... → {tx.receiver?.slice(0, 10)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Account Dashboard Component

```typescript
'use client';

import { useQuery } from '@apollo/client';
import { GET_ACCOUNT } from '@/lib/graphql/queries';

interface AccountDashboardProps {
  readonly address: string;
}

export function AccountDashboard({ address }: AccountDashboardProps): JSX.Element {
  const { data, loading, error } = useQuery(GET_ACCOUNT, {
    variables: { address },
  });

  if (loading) return <div className="p-6">Loading account...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;
  if (!data?.account) return <div className="p-6">Account not found</div>;

  const { account } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Account Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Account Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Address</p>
            <p className="font-mono text-sm">{account.address}</p>
          </div>
          <div>
            <p className="text-gray-600">Balance</p>
            <p className="text-xl font-bold">{account.balance}</p>
          </div>
          <div>
            <p className="text-gray-600">Type</p>
            <p className="capitalize">{account.type}</p>
          </div>
          <div>
            <p className="text-gray-600">Transactions</p>
            <p>{account.txCount}</p>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Analytics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Total Sent</p>
            <p>{account.analytics.totalSent}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Received</p>
            <p>{account.analytics.totalReceived}</p>
          </div>
          <div>
            <p className="text-gray-600">Avg Transaction</p>
            <p>{account.analytics.avgTransactionValue}</p>
          </div>
          <div>
            <p className="text-gray-600">Unique Counterparties</p>
            <p>{account.analytics.uniqueCounterparties}</p>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      {account.contract && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Contract Details</h3>
          <div className="space-y-2">
            <p><strong>Verified:</strong> {account.contract.isVerified ? 'Yes' : 'No'}</p>
            {account.contract.contractName && (
              <p><strong>Name:</strong> {account.contract.contractName}</p>
            )}
            {account.contract.tokenInfo?.isToken && (
              <div>
                <p><strong>Token:</strong> {account.contract.tokenInfo.symbol}</p>
                <p><strong>Decimals:</strong> {account.contract.tokenInfo.decimals}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Paginated Transactions Component

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BLOCKS } from '@/lib/graphql/queries';

export function PaginatedBlocks(): JSX.Element {
  const { data, loading, error, fetchMore } = useQuery(GET_BLOCKS, {
    variables: { first: 20 },
  });

  const loadMore = async () => {
    if (!data?.blocks.pageInfo.hasNextPage) return;

    await fetchMore({
      variables: {
        after: data.blocks.pageInfo.endCursor,
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Recent Blocks</h2>

      <div className="space-y-4">
        {data.blocks.edges.map(({ node: block }: any) => (
          <div key={block.height} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between">
              <span className="font-bold">Block #{block.height}</span>
              <span>{block.transactionCount} txs</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {new Date(block.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {data.blocks.pageInfo.hasNextPage && (
        <button
          onClick={loadMore}
          className="mt-6 h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Load More
        </button>
      )}
    </div>
  );
}
```

## 🔄 Server-Side Integration

### Next.js Server Component

```typescript
import { executeQuery, GET_NETWORK_STATS } from '@/lib/graphql';

export default async function StatsPage() {
  const data = await executeQuery(GET_NETWORK_STATS, {});

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Network Statistics</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">Total Blocks</p>
          <p className="text-3xl font-bold">{data.stats.totalBlocks}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">Total Transactions</p>
          <p className="text-3xl font-bold">{data.stats.totalTransactions}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">Active Validators</p>
          <p className="text-3xl font-bold">{data.stats.activeValidators}</p>
        </div>
      </div>
    </div>
  );
}
```

### API Route Handler

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, GET_ACCOUNT } from '@/lib/graphql';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
): Promise<NextResponse> {
  try {
    const data = await executeQuery(
      GET_ACCOUNT,
      { address: params.address },
      {
        apiKey: request.headers.get('x-api-key') || undefined,
      }
    );

    return NextResponse.json({ success: true, data: data.account });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

## 🎣 Custom Hooks

### useBlock Hook

```typescript
import { useQuery } from '@apollo/client';
import { GET_BLOCK } from '@/lib/graphql/queries';

export function useBlock(height: number) {
  return useQuery(GET_BLOCK, {
    variables: { height },
    skip: !height,
  });
}
```

### useAccount Hook

```typescript
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT } from '@/lib/graphql/queries';

export function useAccount(address: string) {
  return useQuery(GET_ACCOUNT, {
    variables: { address },
    skip: !address,
  });
}
```

### useNetworkStats Hook

```typescript
import { useQuery } from '@apollo/client';
import { GET_NETWORK_STATS } from '@/lib/graphql/queries';

export function useNetworkStats(pollInterval = 5000) {
  return useQuery(GET_NETWORK_STATS, {
    pollInterval,
  });
}
```

## 🔔 Real-time Updates

### useNewBlocks Hook

```typescript
import { useState, useEffect } from 'react';
import { subscribeToQuery, SUBSCRIBE_NEW_BLOCK } from '@/lib/graphql';

export function useNewBlocks() {
  const [latestBlock, setLatestBlock] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = subscribeToQuery(
      SUBSCRIBE_NEW_BLOCK,
      {},
      {
        onData: (data: any) => {
          setLatestBlock(data.newBlock);
        },
      }
    );

    return unsubscribe;
  }, []);

  return latestBlock;
}
```

### useAccountActivity Hook

```typescript
import { useState, useEffect } from 'react';
import { subscribeToQuery, SUBSCRIBE_ACCOUNT_ACTIVITY } from '@/lib/graphql';

export function useAccountActivity(address: string) {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!address) return;

    const unsubscribe = subscribeToQuery(
      SUBSCRIBE_ACCOUNT_ACTIVITY,
      { address },
      {
        onData: (data: any) => {
          setActivities((prev) => [data.accountActivity, ...prev.slice(0, 99)]);
        },
      }
    );

    return unsubscribe;
  }, [address]);

  return activities;
}
```

## 📊 Advanced Patterns

### Optimistic Updates

```typescript
const [updateAccount] = useMutation(UPDATE_ACCOUNT, {
  optimisticResponse: {
    updateAccount: {
      __typename: 'Account',
      id: accountId,
      balance: newBalance,
    },
  },
  update: (cache, { data }) => {
    cache.modify({
      id: cache.identify({ __typename: 'Account', id: accountId }),
      fields: {
        balance: () => data.updateAccount.balance,
      },
    });
  },
});
```

### Error Boundary

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GraphQLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🚀 Production Checklist

- [ ] Configure API keys properly
- [ ] Set up rate limiting monitoring
- [ ] Implement error tracking (Sentry, etc.)
- [ ] Configure caching strategies
- [ ] Set up subscription reconnection logic
- [ ] Implement request retry logic
- [ ] Add loading skeletons
- [ ] Test error scenarios
- [ ] Monitor query performance
- [ ] Set up analytics

## 📝 Best Practices

1. **Use DataLoader**: All nested queries use DataLoader automatically
2. **Cache Configuration**: Configure cache policies per query
3. **Error Handling**: Always handle errors gracefully
4. **Loading States**: Provide proper loading UI
5. **Pagination**: Use cursor-based pagination for large datasets
6. **Subscriptions**: Implement reconnection logic
7. **Type Safety**: Use generated TypeScript types
8. **Testing**: Test all GraphQL operations

## 🔧 Troubleshooting

### Query Not Updating

```typescript
// Force network request
const { data, refetch } = useQuery(GET_BLOCK, {
  variables: { height },
  fetchPolicy: 'network-only',
});
```

### Subscription Disconnected

```typescript
useEffect(() => {
  let unsubscribe: (() => void) | null = null;
  let reconnectTimer: NodeJS.Timeout;

  const connect = () => {
    unsubscribe = subscribeToQuery(
      SUBSCRIBE_NEW_BLOCK,
      {},
      {
        onData: handleData,
        onError: () => {
          // Reconnect after 5 seconds
          reconnectTimer = setTimeout(connect, 5000);
        },
      }
    );
  };

  connect();

  return () => {
    unsubscribe?.();
    clearTimeout(reconnectTimer);
  };
}, []);
```

### Cache Issues

```typescript
// Clear cache
await client.clearStore();

// Reset store
await client.resetStore();

// Evict specific query
client.cache.evict({ id: 'Block:12345' });
```
