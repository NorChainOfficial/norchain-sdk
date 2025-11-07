import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
): Promise<NextResponse> {
  try {
    const txHash = params.hash;

    // Validate transaction hash format
    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
        { status: 400 }
      );
    }

    // Connect to RPC
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Fetch transaction and receipt
    const [tx, receipt] = await Promise.all([
      provider.getTransaction(txHash),
      provider.getTransactionReceipt(txHash),
    ]);

    if (!tx) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Get block for timestamp
    let block = null;
    if (tx.blockNumber) {
      block = await provider.getBlock(tx.blockNumber);
    }

    // Format response
    const formattedTx = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || null,
      value: tx.value.toString(),
      gas: tx.gasLimit.toString(),
      gas_price: tx.gasPrice?.toString() || '0',
      max_fee_per_gas: tx.maxFeePerGas?.toString() || null,
      max_priority_fee_per_gas: tx.maxPriorityFeePerGas?.toString() || null,
      nonce: tx.nonce,
      block_hash: tx.blockHash,
      block_number: tx.blockNumber,
      transaction_index: tx.index,
      input: tx.data,
      type: tx.type,
      chain_id: tx.chainId?.toString() || null,
      timestamp: block?.timestamp || null,

      // Receipt data (if available)
      status: receipt?.status !== undefined ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
      gas_used: receipt?.gasUsed.toString() || null,
      cumulative_gas_used: receipt?.cumulativeGasUsed.toString() || null,
      effective_gas_price: receipt?.gasPrice?.toString() || null,
      contract_address: receipt?.contractAddress || null,
      logs: receipt?.logs.map((log) => ({
        address: log.address,
        topics: log.topics,
        data: log.data,
        block_number: log.blockNumber,
        transaction_hash: log.transactionHash,
        transaction_index: log.transactionIndex,
        block_hash: log.blockHash,
        log_index: log.index,
        removed: log.removed,
      })) || [],
      logs_bloom: receipt?.logsBloom || null,
    };

    return NextResponse.json({ data: formattedTx });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
