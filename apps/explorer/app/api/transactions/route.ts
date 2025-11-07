import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const blockHeight = searchParams.get('block_height');

    // Connect to RPC
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    let transactions: any[] = [];

    if (blockHeight) {
      // Get transactions from a specific block
      const blockNumber = parseInt(blockHeight);
      const block = await provider.getBlock(blockNumber, true);

      if (!block) {
        return NextResponse.json(
          { error: 'Block not found' },
          { status: 404 }
        );
      }

      // Get full transaction details
      const txPromises = block.transactions.map((txHash) =>
        provider.getTransaction(txHash)
      );
      const txs = await Promise.all(txPromises);

      transactions = txs
        .filter((tx): tx is ethers.TransactionResponse => tx !== null)
        .map((tx) => ({
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
          timestamp: block.timestamp,
        }));
    } else {
      // Get recent transactions from latest blocks
      const latestBlockNumber = await provider.getBlockNumber();
      const startBlock = Math.max(0, latestBlockNumber - 10); // Look at last 10 blocks

      const blockPromises: Promise<ethers.Block | null>[] = [];
      for (let i = latestBlockNumber; i >= startBlock; i--) {
        blockPromises.push(provider.getBlock(i, true));
      }

      const blocks = await Promise.all(blockPromises);
      const allTransactions: any[] = [];

      for (const block of blocks) {
        if (!block || !block.transactions.length) continue;

        const txPromises = block.transactions.map((txHash) =>
          provider.getTransaction(txHash)
        );
        const txs = await Promise.all(txPromises);

        const formattedTxs = txs
          .filter((tx): tx is ethers.TransactionResponse => tx !== null)
          .map((tx) => ({
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
            timestamp: block.timestamp,
          }));

        allTransactions.push(...formattedTxs);
      }

      // Paginate results
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      transactions = allTransactions.slice(startIndex, endIndex);
    }

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        per_page: perPage,
        total: transactions.length,
        total_pages: Math.ceil(transactions.length / perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
