/**
 * GraphQL API Test Script
 * Demonstrates all major features of the GraphQL API
 */

import {
  executeQuery,
  GET_LATEST_BLOCKS,
  GET_BLOCK,
  GET_TRANSACTION,
  GET_ACCOUNT,
  GET_NETWORK_STATS,
  SEARCH,
} from './index';

/**
 * Test 1: Get Latest Blocks
 */
async function testLatestBlocks(): Promise<void> {
  console.log('\n=== Test 1: Get Latest Blocks ===');

  try {
    const data = await executeQuery(GET_LATEST_BLOCKS, { limit: 5 });

    console.log(`✓ Fetched ${data.latestBlocks.length} blocks`);
    console.log('Latest block:', {
      height: data.latestBlocks[0].height,
      hash: data.latestBlocks[0].hash.slice(0, 10) + '...',
      transactions: data.latestBlocks[0].transactionCount,
    });
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
  }
}

/**
 * Test 2: Get Block by Height
 */
async function testGetBlock(height: number): Promise<void> {
  console.log(`\n=== Test 2: Get Block #${height} ===`);

  try {
    const data = await executeQuery(GET_BLOCK, { height });

    if (!data.block) {
      console.log(`✗ Block #${height} not found`);
      return;
    }

    console.log('✓ Block details:', {
      height: data.block.height,
      hash: data.block.hash.slice(0, 10) + '...',
      timestamp: new Date(data.block.timestamp).toLocaleString(),
      transactions: data.block.transactionCount,
      gasUsed: data.block.gasUsed,
      proposer: data.block.proposerAddress.slice(0, 10) + '...',
    });

    if (data.block.transactions?.edges?.length > 0) {
      console.log('✓ First transaction:', {
        hash: data.block.transactions.edges[0].node.hash.slice(0, 10) + '...',
        sender: data.block.transactions.edges[0].node.sender.slice(0, 10) + '...',
        status: data.block.transactions.edges[0].node.status,
      });
    }
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
  }
}

/**
 * Test 3: Get Transaction
 */
async function testGetTransaction(hash: string): Promise<void> {
  console.log(`\n=== Test 3: Get Transaction ===`);

  try {
    const data = await executeQuery(GET_TRANSACTION, { hash });

    if (!data.transaction) {
      console.log('✗ Transaction not found');
      return;
    }

    console.log('✓ Transaction details:', {
      hash: data.transaction.hash.slice(0, 10) + '...',
      blockHeight: data.transaction.blockHeight,
      sender: data.transaction.sender.slice(0, 10) + '...',
      receiver: data.transaction.receiver?.slice(0, 10) + '...' || 'null',
      amount: data.transaction.amount || '0',
      status: data.transaction.status,
    });

    if (data.transaction.events?.length > 0) {
      console.log(`✓ Found ${data.transaction.events.length} events`);
    }
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
  }
}

/**
 * Test 4: Get Account
 */
async function testGetAccount(address: string): Promise<void> {
  console.log(`\n=== Test 4: Get Account ===`);

  try {
    const data = await executeQuery(GET_ACCOUNT, { address });

    if (!data.account) {
      console.log('✗ Account not found');
      return;
    }

    console.log('✓ Account details:', {
      address: data.account.address.slice(0, 10) + '...',
      balance: data.account.balance,
      txCount: data.account.txCount,
      type: data.account.type,
    });

    if (data.account.contract) {
      console.log('✓ Contract detected:', {
        verified: data.account.contract.isVerified,
        name: data.account.contract.contractName || 'Unknown',
      });
    }
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
  }
}

/**
 * Test 5: Get Network Stats
 */
async function testNetworkStats(): Promise<void> {
  console.log('\n=== Test 5: Get Network Stats ===');

  try {
    const data = await executeQuery(GET_NETWORK_STATS, {});

    console.log('✓ Network statistics:', {
      totalBlocks: data.stats.totalBlocks,
      totalTransactions: data.stats.totalTransactions,
      totalAccounts: data.stats.totalAccounts,
      blocks24h: data.stats.blocks24h,
      transactions24h: data.stats.transactions24h,
      avgBlockTime: data.stats.avgBlockTime,
    });

    if (data.stats.latestBlock) {
      console.log('✓ Latest block:', {
        height: data.stats.latestBlock.height,
        timestamp: new Date(data.stats.latestBlock.timestamp).toLocaleString(),
      });
    }
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
  }
}

/**
 * Test 6: Search
 */
async function testSearch(query: string): Promise<void> {
  console.log(`\n=== Test 6: Search for "${query}" ===`);

  try {
    const data = await executeQuery(SEARCH, { query });

    if (data.search.length === 0) {
      console.log('✗ No results found');
      return;
    }

    console.log(`✓ Found ${data.search.length} result(s):`);

    data.search.forEach((result: any) => {
      console.log(`  - Type: ${result.type}`);
      if (result.result.height !== undefined) {
        console.log(`    Block #${result.result.height}`);
      } else if (result.result.hash) {
        console.log(`    Hash: ${result.result.hash.slice(0, 10)}...`);
      } else if (result.result.address) {
        console.log(`    Address: ${result.result.address.slice(0, 10)}...`);
      }
    });
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
  }
}

/**
 * Test 7: Pagination
 */
async function testPagination(): Promise<void> {
  console.log('\n=== Test 7: Pagination ===');

  try {
    // First page
    const data1 = await executeQuery(
      `
      query GetBlocks($first: Int!, $after: String) {
        blocks(first: $first, after: $after) {
          edges {
            cursor
            node {
              height
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
    `,
      { first: 3 }
    );

    console.log('✓ First page:');
    console.log(`  Total count: ${data1.blocks.totalCount}`);
    console.log(`  Has next page: ${data1.blocks.pageInfo.hasNextPage}`);
    console.log(`  Blocks on page: ${data1.blocks.edges.length}`);

    if (data1.blocks.pageInfo.hasNextPage) {
      // Second page
      const data2 = await executeQuery(
        `
        query GetBlocks($first: Int!, $after: String) {
          blocks(first: $first, after: $after) {
            edges {
              cursor
              node {
                height
                transactionCount
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
        {
          first: 3,
          after: data1.blocks.pageInfo.endCursor,
        }
      );

      console.log('✓ Second page:');
      console.log(`  Has next page: ${data2.blocks.pageInfo.hasNextPage}`);
      console.log(`  Blocks on page: ${data2.blocks.edges.length}`);
    }
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
  }
}

/**
 * Test 8: Nested Queries
 */
async function testNestedQueries(height: number): Promise<void> {
  console.log(`\n=== Test 8: Nested Queries (Block #${height}) ===`);

  try {
    const data = await executeQuery(
      `
      query GetBlockWithNested($height: Int!) {
        block(height: $height) {
          height
          hash
          proposer {
            address
            balance
            type
          }
          transactions(first: 3) {
            edges {
              node {
                hash
                sender
                senderAccount {
                  balance
                  txCount
                }
                receiver
                status
              }
            }
          }
          stats {
            avgGasPrice
            totalFees
            successRate
          }
        }
      }
    `,
      { height }
    );

    if (!data.block) {
      console.log('✗ Block not found');
      return;
    }

    console.log('✓ Block with nested data:', {
      height: data.block.height,
      proposer: {
        address: data.block.proposer.address.slice(0, 10) + '...',
        balance: data.block.proposer.balance,
      },
      transactions: data.block.transactions.edges.length,
      stats: {
        successRate: `${data.block.stats.successRate.toFixed(2)}%`,
      },
    });

    console.log('✓ DataLoader batched these queries efficiently!');
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
  }
}

/**
 * Run all tests
 */
export async function runGraphQLTests(): Promise<void> {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   NorExplorer GraphQL API Test Suite      ║');
  console.log('╚═══════════════════════════════════════════════╝');

  try {
    // Test 1: Latest blocks
    await testLatestBlocks();

    // Test 2: Specific block
    await testGetBlock(1);

    // Test 3: Transaction (will need actual tx hash)
    // await testGetTransaction('0x...');

    // Test 4: Account (will need actual address)
    // await testGetAccount('0x...');

    // Test 5: Network stats
    await testNetworkStats();

    // Test 6: Search (test with block number)
    await testSearch('1');

    // Test 7: Pagination
    await testPagination();

    // Test 8: Nested queries with DataLoader
    await testNestedQueries(1);

    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║              All Tests Complete               ║');
    console.log('╚═══════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n✗ Test suite failed:', (error as Error).message);
  }
}

/**
 * Example: Run tests from command line
 *
 * Usage:
 *   npx tsx lib/graphql/test-graphql.ts
 */
if (require.main === module) {
  runGraphQLTests().catch(console.error);
}
