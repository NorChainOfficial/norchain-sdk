/**
 * Custom GraphQL Scalars
 * Type-safe scalar implementations for blockchain data types
 */

import { GraphQLScalarType, Kind } from 'graphql';

/**
 * DateTime scalar - ISO 8601 date-time strings
 */
export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 date-time string',

  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    throw new Error('DateTime must be a Date object or ISO string');
  },

  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('DateTime must be an ISO 8601 string');
  },

  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('DateTime must be an ISO 8601 string');
  },
});

/**
 * BigInt scalar - Large integer values (balances, gas, etc.)
 */
export const BigIntScalar = new GraphQLScalarType({
  name: 'BigInt',
  description: 'Large integer values as strings to prevent precision loss',

  serialize(value: unknown): string {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return value.toString();
    }
    throw new Error('BigInt must be a bigint, string, or number');
  },

  parseValue(value: unknown): bigint {
    if (typeof value === 'string' || typeof value === 'number') {
      return BigInt(value);
    }
    throw new Error('BigInt must be a string or number');
  },

  parseLiteral(ast): bigint {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return BigInt(ast.value);
    }
    throw new Error('BigInt must be a string or integer');
  },
});

/**
 * Address scalar - Ethereum/Blockchain addresses
 */
export const AddressScalar = new GraphQLScalarType({
  name: 'Address',
  description: 'Blockchain address (0x-prefixed hex string)',

  serialize(value: unknown): string {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    throw new Error('Address must be a string');
  },

  parseValue(value: unknown): string {
    if (typeof value !== 'string') {
      throw new Error('Address must be a string');
    }

    // Basic validation
    if (!value.startsWith('0x') && !value.match(/^[a-zA-Z0-9]+$/)) {
      throw new Error('Invalid address format');
    }

    return value.toLowerCase();
  },

  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING) {
      throw new Error('Address must be a string');
    }

    const value = ast.value;
    if (!value.startsWith('0x') && !value.match(/^[a-zA-Z0-9]+$/)) {
      throw new Error('Invalid address format');
    }

    return value.toLowerCase();
  },
});

/**
 * Hash scalar - Transaction/Block hashes
 */
export const HashScalar = new GraphQLScalarType({
  name: 'Hash',
  description: 'Blockchain hash (0x-prefixed hex string)',

  serialize(value: unknown): string {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    throw new Error('Hash must be a string');
  },

  parseValue(value: unknown): string {
    if (typeof value !== 'string') {
      throw new Error('Hash must be a string');
    }

    // Basic validation for hex string
    if (!value.match(/^0x[0-9a-fA-F]+$/)) {
      throw new Error('Invalid hash format - must be 0x-prefixed hex string');
    }

    return value.toLowerCase();
  },

  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING) {
      throw new Error('Hash must be a string');
    }

    const value = ast.value;
    if (!value.match(/^0x[0-9a-fA-F]+$/)) {
      throw new Error('Invalid hash format - must be 0x-prefixed hex string');
    }

    return value.toLowerCase();
  },
});

/**
 * All custom scalars for schema
 */
export const customScalars = {
  DateTime: DateTimeScalar,
  BigInt: BigIntScalar,
  Address: AddressScalar,
  Hash: HashScalar,
};
