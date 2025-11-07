import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
): Promise<NextResponse> {
  try {
    const address = params.address;

    // Validate address format
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Connect to RPC
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Fetch account data
    const [balance, transactionCount, code] = await Promise.all([
      provider.getBalance(address),
      provider.getTransactionCount(address),
      provider.getCode(address),
    ]);

    // Determine if address is a contract
    const isContract = code !== '0x';

    // Get recent transactions involving this address
    const latestBlockNumber = await provider.getBlockNumber();
    const startBlock = Math.max(0, latestBlockNumber - 10); // Look at last 10 blocks

    const recentTransactions: any[] = [];

    for (let i = latestBlockNumber; i >= startBlock && recentTransactions.length < 20; i--) {
      const block = await provider.getBlock(i, true);
      if (!block) continue;

      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (!tx) continue;

        // Check if transaction involves this address
        if (
          tx.from.toLowerCase() === address.toLowerCase() ||
          (tx.to && tx.to.toLowerCase() === address.toLowerCase())
        ) {
          const receipt = await provider.getTransactionReceipt(txHash);

          recentTransactions.push({
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
            status: receipt?.status !== undefined ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
            timestamp: block.timestamp,
          });

          if (recentTransactions.length >= 20) break;
        }
      }
    }

    // Format response
    const accountData = {
      address,
      balance: balance.toString(),
      balance_eth: ethers.formatEther(balance),
      transaction_count: transactionCount,
      is_contract: isContract,
      code: isContract ? code : null,
      code_size: isContract ? (code.length - 2) / 2 : 0, // Subtract '0x' and divide by 2 for byte count
      recent_transactions: recentTransactions,
    };

    return NextResponse.json({ data: accountData });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
