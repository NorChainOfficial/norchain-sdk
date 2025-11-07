import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

export async function GET(
  request: NextRequest,
  { params }: { params: { height: string } }
): Promise<NextResponse> {
  try {
    const blockHeight = parseInt(params.height);

    if (isNaN(blockHeight) || blockHeight < 0) {
      return NextResponse.json(
        { error: 'Invalid block height' },
        { status: 400 }
      );
    }

    // Connect to RPC
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Fetch block with transactions
    const block = await provider.getBlock(blockHeight, true);

    if (!block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    // Format transaction details if prefetched transactions exist
    const transactions = block.prefetchedTransactions
      ? block.prefetchedTransactions.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to || null,
          value: tx.value.toString(),
          gas: tx.gasLimit.toString(),
          gas_price: tx.gasPrice?.toString() || '0',
          nonce: tx.nonce,
          block_hash: tx.blockHash,
          block_number: tx.blockNumber,
          transaction_index: tx.index,
          input: tx.data,
          type: tx.type,
        }))
      : block.transactions.map((txHash) => ({
          hash: txHash,
        }));

    // Format response
    const formattedBlock = {
      height: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      transactions_count: block.transactions.length,
      transactions,
      miner: block.miner,
      gas_used: block.gasUsed.toString(),
      gas_limit: block.gasLimit.toString(),
      size: block.length || 0,
      parent_hash: block.parentHash,
      nonce: block.nonce,
      difficulty: block.difficulty?.toString() || '0',
      extra_data: block.extraData,
      base_fee_per_gas: block.baseFeePerGas?.toString() || null,
    };

    return NextResponse.json({ data: formattedBlock });
  } catch (error) {
    console.error('Error fetching block:', error);
    return NextResponse.json(
      { error: 'Failed to fetch block', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
