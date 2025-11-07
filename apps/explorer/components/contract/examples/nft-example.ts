/**
 * ERC721 (NFT) Example
 * Standard ERC721 implementation for testing contract interactions
 */

export const ERC721_ABI = [
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'getApproved',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setApprovalForAll',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'transferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'payable',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'approved', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'ApprovalForAll',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'approved', type: 'bool', indexed: false },
    ],
  },
] as const;

export const ERC721_EXAMPLE_ADDRESS = '0x9876543210987654321098765432109876543210';

/**
 * Example usage scenarios
 */
export const ERC721_EXAMPLES = {
  // Read examples
  read: {
    name: {
      function: 'name',
      params: [],
      expectedResult: 'My NFT Collection',
    },
    ownerOf: {
      function: 'ownerOf',
      params: ['1'],
      expectedResult: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    },
    tokenURI: {
      function: 'tokenURI',
      params: ['1'],
      expectedResult: 'ipfs://QmHash/1.json',
    },
    balanceOf: {
      function: 'balanceOf',
      params: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'],
      expectedResult: '5', // 5 NFTs
    },
  },

  // Write examples
  write: {
    mint: {
      function: 'mint',
      params: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'],
      value: '0.01', // 0.01 ETH
      description: 'Mint NFT to address (payable)',
    },
    transferFrom: {
      function: 'transferFrom',
      params: [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x1234567890123456789012345678901234567890',
        '1',
      ],
      description: 'Transfer NFT #1 to another address',
    },
    approve: {
      function: 'approve',
      params: ['0x1234567890123456789012345678901234567890', '1'],
      description: 'Approve operator to transfer NFT #1',
    },
  },

  // Batch read example
  batchRead: [
    { function: 'name', params: [] },
    { function: 'symbol', params: [] },
    { function: 'balanceOf', params: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'] },
    { function: 'ownerOf', params: ['1'] },
  ],
};
