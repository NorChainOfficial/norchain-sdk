/**
 * GraphQL API Route
 * Apollo Server integration with Next.js App Router
 */

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { typeDefs } from '../../../lib/graphql/schema';
import { resolvers } from '../../../lib/graphql/resolvers';
import { createContext, loggingPlugin, type GraphQLContext } from '../../../lib/graphql/context';

// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [loggingPlugin],
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    // Log error
    console.error('GraphQL Error:', {
      message: error.message,
      path: error.path,
      extensions: error.extensions,
    });

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      if (error.message.includes('Rate limit')) {
        return {
          message: 'Rate limit exceeded. Please try again later.',
          extensions: {
            code: 'RATE_LIMIT_EXCEEDED',
          },
        };
      }

      if (error.message.includes('Invalid API key')) {
        return {
          message: 'Invalid API key',
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        };
      }

      // Generic error
      return {
        message: 'An error occurred while processing your request',
        extensions: {
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        },
      };
    }

    // In development, return full error
    return error;
  },
});

// Create Next.js request handler
const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: createContext,
});

/**
 * GET handler - for GraphQL Playground and queries
 */
export async function GET(request: NextRequest): Promise<Response> {
  return handler(request);
}

/**
 * POST handler - for GraphQL mutations and queries
 */
export async function POST(request: NextRequest): Promise<Response> {
  return handler(request);
}

/**
 * OPTIONS handler - for CORS preflight
 */
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
