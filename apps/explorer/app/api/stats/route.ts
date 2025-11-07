import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';
const CHAIN_ID = 885824;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to RPC
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Fetch current network stats
    const [latestBlockNumber, network, feeData] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork(),
      provider.getFeeData(),
    ]);

    // Get latest block for additional stats
    const latestBlock = await provider.getBlock(latestBlockNumber);

    if (!latestBlock) {
      throw new Error('Failed to fetch latest block');
    }

    // Calculate average block time from last 10 blocks
    const blockPromises: Promise<ethers.Block | null>[] = [];
    const numBlocks = Math.min(10, latestBlockNumber);
    for (let i = 0; i < numBlocks; i++) {
      blockPromises.push(provider.getBlock(latestBlockNumber - i));
    }
    const blocks = await Promise.all(blockPromises);
    const validBlocks = blocks.filter((b): b is ethers.Block => b !== null);

    let avgBlockTime = 5; // Default 5 seconds for Clique PoA
    if (validBlocks.length >= 2) {
      const firstBlock = validBlocks[validBlocks.length - 1];
      const lastBlock = validBlocks[0];
      const timeDiff = lastBlock.timestamp - firstBlock.timestamp;
      const blockDiff = lastBlock.number - firstBlock.number;
      if (blockDiff > 0) {
        avgBlockTime = timeDiff / blockDiff;
      }
    }

    // Calculate total transactions
    let totalTransactions = 0;
    for (const block of validBlocks) {
      totalTransactions += block.transactions.length;
    }

    // Get gas price statistics
    const gasPrices: bigint[] = [];
    for (const block of validBlocks) {
      if (block.baseFeePerGas) {
        gasPrices.push(block.baseFeePerGas);
      }
    }

    const avgGasPrice = gasPrices.length > 0
      ? gasPrices.reduce((a, b) => a + b, BigInt(0)) / BigInt(gasPrices.length)
      : BigInt(0);

    // Format response
    const stats = {
      chain_id: CHAIN_ID.toString(),
      network_name: 'BTCBR Mainnet',
      latest_block: latestBlockNumber,
      total_transactions: totalTransactions,
      avg_block_time: avgBlockTime,
      avg_gas_price: avgGasPrice.toString(),
      gas_price: feeData.gasPrice?.toString() || '0',
      max_priority_fee_per_gas: feeData.maxPriorityFeePerGas?.toString() || null,
      max_fee_per_gas: feeData.maxFeePerGas?.toString() || null,
      latest_block_timestamp: latestBlock.timestamp,
      latest_block_hash: latestBlock.hash,
      latest_block_miner: latestBlock.miner,
      latest_block_gas_used: latestBlock.gasUsed.toString(),
      latest_block_gas_limit: latestBlock.gasLimit.toString(),
      latest_block_transactions: latestBlock.transactions.length,
      consensus: 'Clique PoA',
      block_time_target: 5, // 5 second blocks
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
