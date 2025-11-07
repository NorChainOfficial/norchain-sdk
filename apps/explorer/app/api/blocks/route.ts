import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    // Connect to RPC
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Get latest block number
    const latestBlockNumber = await provider.getBlockNumber();

    // Calculate range
    const startBlock = Math.max(0, latestBlockNumber - (page - 1) * perPage - perPage);
    const endBlock = Math.max(0, latestBlockNumber - (page - 1) * perPage);

    // Fetch blocks in range
    const blockPromises: Promise<ethers.Block | null>[] = [];
    for (let i = endBlock; i > startBlock && blockPromises.length < perPage; i--) {
      blockPromises.push(provider.getBlock(i));
    }

    const blocks = await Promise.all(blockPromises);

    // Format response
    const formattedBlocks = blocks
      .filter((block): block is ethers.Block => block !== null)
      .map((block) => ({
        height: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        transactions_count: block.transactions.length,
        miner: block.miner,
        gas_used: block.gasUsed.toString(),
        gas_limit: block.gasLimit.toString(),
        size: block.length || 0,
        parent_hash: block.parentHash,
        nonce: block.nonce,
        difficulty: block.difficulty?.toString() || '0',
      }));

    return NextResponse.json({
      data: formattedBlocks,
      pagination: {
        page,
        per_page: perPage,
        total: latestBlockNumber + 1,
        total_pages: Math.ceil((latestBlockNumber + 1) / perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
