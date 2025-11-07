/**
 * GraphQL Client SDK
 * Type-safe client with automatic retries and caching
 */

import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || '/api/graphql';

/**
 * Error handling link
 */
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

/**
 * Retry link for failed requests
 */
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 5000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors and specific GraphQL errors
      return (
        !!error ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('network')
      );
    },
  },
});

/**
 * HTTP link with custom headers
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API Key middleware
 */
const apiKeyLink = new ApolloLink((operation, forward) => {
  // Get API key from environment or operation context
  const apiKey =
    operation.getContext().apiKey ||
    process.env.NEXT_PUBLIC_XAHEEN_API_KEY;

  if (apiKey) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'x-api-key': apiKey,
      },
    }));
  }

  return forward(operation);
});

/**
 * Cache configuration
 */
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Pagination field policy for blocks
        blocks: {
          keyArgs: ['filter'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;

            const edges = [...(existing.edges || [])];
            const newEdges = incoming.edges || [];

            // Merge edges avoiding duplicates
            const edgeMap = new Map(
              edges.map((edge: any) => [edge.cursor, edge])
            );

            newEdges.forEach((edge: any) => {
              edgeMap.set(edge.cursor, edge);
            });

            return {
              ...incoming,
              edges: Array.from(edgeMap.values()),
            };
          },
        },

        // Similar policies for other paginated fields
        transactions: {
          keyArgs: ['filter'],
          merge(existing, incoming) {
            if (!existing) return incoming;

            const edges = [...(existing.edges || [])];
            const newEdges = incoming.edges || [];

            const edgeMap = new Map(
              edges.map((edge: any) => [edge.cursor, edge])
            );

            newEdges.forEach((edge: any) => {
              edgeMap.set(edge.cursor, edge);
            });

            return {
              ...incoming,
              edges: Array.from(edgeMap.values()),
            };
          },
        },

        accounts: {
          keyArgs: ['filter', 'orderBy'],
          merge(existing, incoming) {
            if (!existing) return incoming;

            const edges = [...(existing.edges || [])];
            const newEdges = incoming.edges || [];

            const edgeMap = new Map(
              edges.map((edge: any) => [edge.cursor, edge])
            );

            newEdges.forEach((edge: any) => {
              edgeMap.set(edge.cursor, edge);
            });

            return {
              ...incoming,
              edges: Array.from(edgeMap.values()),
            };
          },
        },
      },
    },

    // Cache block by height (unique identifier)
    Block: {
      keyFields: ['height'],
    },

    // Cache transaction by hash
    Transaction: {
      keyFields: ['hash'],
    },

    // Cache account by address
    Account: {
      keyFields: ['address'],
    },

    // Cache contract by address
    Contract: {
      keyFields: ['address'],
    },

    // Cache token by address
    Token: {
      keyFields: ['address'],
    },
  },
});

/**
 * Create Apollo Client
 */
export const createGraphQLClient = (apiKey?: string): ApolloClient<any> => {
  return new ApolloClient({
    link: from([errorLink, apiKeyLink, retryLink, httpLink]),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    connectToDevTools: process.env.NODE_ENV === 'development',
  });
};

/**
 * Default client instance
 */
export const graphqlClient = createGraphQLClient();

/**
 * Helper function to execute queries with retries
 */
export async function executeQuery<T>(
  query: any,
  variables?: any,
  options?: {
    apiKey?: string;
    maxRetries?: number;
    cachePolicy?: 'cache-first' | 'network-only' | 'cache-and-network';
  }
): Promise<T> {
  const client = options?.apiKey
    ? createGraphQLClient(options.apiKey)
    : graphqlClient;

  const result = await client.query({
    query,
    variables,
    fetchPolicy: options?.cachePolicy || 'network-only',
  });

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

/**
 * Helper function for subscriptions
 */
export function subscribeToQuery<T>(
  subscription: any,
  variables?: any,
  options?: {
    apiKey?: string;
    onData?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): () => void {
  const client = options?.apiKey
    ? createGraphQLClient(options.apiKey)
    : graphqlClient;

  const observable = client.subscribe({
    query: subscription,
    variables,
  });

  const subscription_ = observable.subscribe({
    next: (result) => {
      if (result.data) {
        options?.onData?.(result.data as T);
      }
      if (result.errors) {
        options?.onError?.(new Error(result.errors[0].message));
      }
    },
    error: (error) => {
      options?.onError?.(error);
    },
  });

  return () => subscription_.unsubscribe();
}
