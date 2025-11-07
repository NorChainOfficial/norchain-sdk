/**
 * Complex Types Example
 * Demonstrates handling of complex Solidity types in contract interactions
 */

export const COMPLEX_TYPES_ABI = [
  // Array types
  {
    type: 'function',
    name: 'getArray',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'values', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'setArray',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'values', type: 'uint256[]' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getStringArray',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'strings', type: 'string[]' }],
  },
  {
    type: 'function',
    name: 'getAddressArray',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'addresses', type: 'address[]' }],
  },

  // Tuple (struct) types
  {
    type: 'function',
    name: 'getUser',
    stateMutability: 'view',
    inputs: [{ name: 'userId', type: 'uint256' }],
    outputs: [
      {
        name: 'user',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'walletAddress', type: 'address' },
          { name: 'isActive', type: 'bool' },
          { name: 'balance', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'createUser',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'walletAddress', type: 'address' },
    ],
    outputs: [{ name: 'userId', type: 'uint256' }],
  },

  // Multiple return values
  {
    type: 'function',
    name: 'getMultiple',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'value1', type: 'uint256' },
      { name: 'value2', type: 'string' },
      { name: 'value3', type: 'address' },
      { name: 'value4', type: 'bool' },
    ],
  },

  // Bytes types
  {
    type: 'function',
    name: 'getBytes',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'data', type: 'bytes' }],
  },
  {
    type: 'function',
    name: 'getBytes32',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'hash', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'setBytes32',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'hash', type: 'bytes32' }],
    outputs: [],
  },

  // Integer variants
  {
    type: 'function',
    name: 'getInt8',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'value', type: 'int8' }],
  },
  {
    type: 'function',
    name: 'getUint128',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'value', type: 'uint128' }],
  },
  {
    type: 'function',
    name: 'addNumbers',
    stateMutability: 'pure',
    inputs: [
      { name: 'a', type: 'uint256' },
      { name: 'b', type: 'uint256' },
    ],
    outputs: [{ name: 'sum', type: 'uint256' }],
  },

  // Nested arrays
  {
    type: 'function',
    name: 'getMatrix',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'matrix', type: 'uint256[][]' }],
  },

  // Array of tuples
  {
    type: 'function',
    name: 'getUsers',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: 'users',
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'walletAddress', type: 'address' },
        ],
      },
    ],
  },

  // Mapping queries (via getter)
  {
    type: 'function',
    name: 'balances',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },

  // Enum type (represented as uint8)
  {
    type: 'function',
    name: 'getStatus',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: 'status', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'setStatus',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'id', type: 'uint256' },
      { name: 'status', type: 'uint8' },
    ],
    outputs: [],
  },

  // Events with complex types
  {
    type: 'event',
    name: 'UserCreated',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'wallet', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'DataUpdated',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'values', type: 'uint256[]', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const;

export const COMPLEX_TYPES_EXAMPLE_ADDRESS =
  '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';

/**
 * Example usage scenarios with validation examples
 */
export const COMPLEX_TYPES_EXAMPLES = {
  // Read examples
  read: {
    getArray: {
      function: 'getArray',
      params: [],
      expectedResult: [1, 2, 3, 4, 5],
      description: 'Get array of uint256',
    },
    getUser: {
      function: 'getUser',
      params: ['1'],
      expectedResult: {
        id: 1,
        name: 'Alice',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        isActive: true,
        balance: '1000000000000000000',
      },
      description: 'Get user struct',
    },
    getMultiple: {
      function: 'getMultiple',
      params: [],
      expectedResult: [
        123,
        'Hello World',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        true,
      ],
      description: 'Multiple return values',
    },
    getBytes32: {
      function: 'getBytes32',
      params: [],
      expectedResult:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      description: 'Fixed-size bytes',
    },
  },

  // Write examples
  write: {
    setArray: {
      function: 'setArray',
      params: ['[1, 2, 3, 4, 5]'], // Input as JSON string
      description: 'Set array of numbers',
      validInputs: [
        '[1, 2, 3]',
        '[100, 200, 300]',
        '[]', // Empty array
      ],
      invalidInputs: [
        'not an array',
        '[1, "two", 3]', // Mixed types
        '1, 2, 3', // Not JSON
      ],
    },
    createUser: {
      function: 'createUser',
      params: ['Alice', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'],
      description: 'Create new user',
      validInputs: {
        name: ['Alice', 'Bob Smith', 'User123'],
        address: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'],
      },
      invalidInputs: {
        name: ['', ' '], // Empty strings might be invalid
        address: ['0xinvalid', '742d35Cc', 'not an address'],
      },
    },
    setBytes32: {
      function: 'setBytes32',
      params: [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      ],
      description: 'Set bytes32 hash',
      validInputs: [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      ],
      invalidInputs: [
        '0x1234', // Too short
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00', // Too long
        'not bytes',
      ],
    },
  },

  // Input validation examples
  validation: {
    uint256: {
      valid: ['0', '123', '999999999999', '0x1e240'],
      invalid: ['-1', 'abc', '1.5', ''],
    },
    address: {
      valid: [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x0000000000000000000000000000000000000000',
      ],
      invalid: [
        '0xinvalid',
        '742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Missing 0x
        '0x742d35Cc', // Too short
      ],
    },
    bool: {
      valid: ['true', 'false', '1', '0'],
      invalid: ['yes', 'no', '2', ''],
    },
    bytes32: {
      valid: [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      ],
      invalid: [
        '0x1234', // Wrong length
        '0xgg00', // Invalid hex
        'not bytes',
      ],
    },
    'uint256[]': {
      valid: ['[]', '[1]', '[1, 2, 3]', '[0, 999999]'],
      invalid: ['not array', '[1, "two"]', '1, 2, 3'],
    },
    'string[]': {
      valid: ['[]', '["a"]', '["hello", "world"]'],
      invalid: ['not array', '[1, 2]', 'hello, world'],
    },
  },

  // Batch read for complex contract
  batchRead: [
    { function: 'getArray', params: [] },
    { function: 'getStringArray', params: [] },
    { function: 'getMultiple', params: [] },
    { function: 'getBytes32', params: [] },
  ],
};

/**
 * Type helper for tuple inputs
 */
export const TupleInputHelper = {
  user: {
    example: JSON.stringify(
      {
        name: 'Alice',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      },
      null,
      2
    ),
    schema: {
      name: 'string',
      walletAddress: 'address',
    },
  },
};
