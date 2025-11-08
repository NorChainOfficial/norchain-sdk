import { Injectable } from '@nestjs/common';
import { RpcService } from '@/common/services/rpc.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';
import { ethers } from 'ethers';

/**
 * Proxy Service
 *
 * Provides JSON-RPC compatible proxy endpoints for direct blockchain access.
 * Implements standard Ethereum JSON-RPC methods.
 */
@Injectable()
export class ProxyService {
  constructor(private rpcService: RpcService) {}

  /**
   * eth_blockNumber - Returns the number of the most recent block.
   */
  async eth_blockNumber() {
    const blockNumber = await this.rpcService.getBlockNumber();
    return ResponseDto.success(`0x${blockNumber.toString(16)}`);
  }

  /**
   * eth_getBalance - Returns the balance of an account.
   */
  async eth_getBalance(address: string, blockTag: string = 'latest') {
    const balance = await this.rpcService.getBalance(address);
    return ResponseDto.success(`0x${balance.toString(16)}`);
  }

  /**
   * eth_getBlockByNumber - Returns information about a block by block number.
   */
  async eth_getBlockByNumber(
    blockTag: string,
    fullTransactions: boolean = false,
  ) {
    const blockNumber =
      blockTag === 'latest' || blockTag === 'pending'
        ? blockTag
        : parseInt(blockTag, 16);

    const block = await this.rpcService.getBlock(blockNumber);

    if (!block) {
      return ResponseDto.error('Block not found');
    }

    return ResponseDto.success(this.formatBlockForRpc(block, fullTransactions));
  }

  /**
   * eth_getTransactionByHash - Returns transaction information by hash.
   */
  async eth_getTransactionByHash(txHash: string) {
    const tx = await this.rpcService.getTransaction(txHash);

    if (!tx) {
      return ResponseDto.error('Transaction not found');
    }

    return ResponseDto.success(this.formatTransactionForRpc(tx));
  }

  /**
   * eth_getTransactionReceipt - Returns transaction receipt by hash.
   */
  async eth_getTransactionReceipt(txHash: string) {
    const receipt = await this.rpcService.getTransactionReceipt(txHash);

    if (!receipt) {
      return ResponseDto.error('Transaction receipt not found');
    }

    return ResponseDto.success(this.formatReceiptForRpc(receipt));
  }

  /**
   * eth_call - Executes a new message call without creating a transaction.
   */
  async eth_call(transaction: any, blockTag: string = 'latest') {
    try {
      const result = await this.rpcService.call(transaction, blockTag);
      return ResponseDto.success(result);
    } catch (error: any) {
      return ResponseDto.error(error.message || 'Call failed');
    }
  }

  /**
   * eth_estimateGas - Estimates gas for a transaction.
   */
  async eth_estimateGas(transaction: any) {
    try {
      const gasEstimate = await this.rpcService.estimateGas(transaction);
      return ResponseDto.success(`0x${gasEstimate.toString(16)}`);
    } catch (error: any) {
      return ResponseDto.error(error.message || 'Gas estimation failed');
    }
  }

  /**
   * eth_getCode - Returns code at a given address.
   */
  async eth_getCode(address: string, blockTag: string = 'latest') {
    const code = await this.rpcService.getCode(address);
    return ResponseDto.success(code);
  }

  /**
   * eth_getLogs - Returns logs matching a filter.
   */
  async eth_getLogs(filter: ethers.Filter) {
    try {
      const logs = await this.rpcService.getLogs(filter);
      return ResponseDto.success(logs.map((log) => this.formatLogForRpc(log)));
    } catch (error: any) {
      return ResponseDto.error(error.message || 'Failed to get logs');
    }
  }

  /**
   * eth_gasPrice - Returns the current gas price.
   */
  async eth_gasPrice() {
    const feeData = await this.rpcService.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    return ResponseDto.success(`0x${gasPrice.toString(16)}`);
  }

  /**
   * Formats block for JSON-RPC response.
   */
  private formatBlockForRpc(block: any, fullTransactions: boolean) {
    return {
      number: `0x${block.number.toString(16)}`,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: `0x${block.timestamp.toString(16)}`,
      gasLimit: `0x${block.gasLimit.toString(16)}`,
      gasUsed: `0x${block.gasUsed.toString(16)}`,
      miner: block.miner,
      difficulty: block.difficulty?.toString() || '0x0',
      extraData: block.extraData || '0x',
      transactions: fullTransactions
        ? block.transactions?.map((tx: any) =>
            typeof tx === 'string' ? tx : this.formatTransactionForRpc(tx),
          ) || []
        : block.transactions?.map((tx: any) =>
            typeof tx === 'string' ? tx : tx.hash,
          ) || [],
      transactionsRoot: '0x',
      stateRoot: '0x',
      receiptsRoot: '0x',
    };
  }

  /**
   * Formats transaction for JSON-RPC response.
   */
  private formatTransactionForRpc(tx: any) {
    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber ? `0x${tx.blockNumber.toString(16)}` : null,
      blockHash: tx.blockHash || null,
      transactionIndex: tx.index ? `0x${tx.index.toString(16)}` : null,
      from: tx.from,
      to: tx.to || null,
      value: `0x${tx.value.toString(16)}`,
      gas: `0x${tx.gasLimit.toString(16)}`,
      gasPrice: tx.gasPrice ? `0x${tx.gasPrice.toString(16)}` : '0x0',
      input: tx.data || '0x',
      nonce: `0x${tx.nonce.toString(16)}`,
    };
  }

  /**
   * Formats receipt for JSON-RPC response.
   */
  private formatReceiptForRpc(receipt: any) {
    return {
      transactionHash: receipt.hash,
      blockNumber: `0x${receipt.blockNumber.toString(16)}`,
      blockHash: receipt.blockHash,
      transactionIndex: `0x${receipt.index.toString(16)}`,
      from: receipt.from,
      to: receipt.to || null,
      gasUsed: `0x${receipt.gasUsed.toString(16)}`,
      cumulativeGasUsed: `0x${receipt.cumulativeGasUsed.toString(16)}`,
      contractAddress: receipt.contractAddress || null,
      logs: receipt.logs?.map((log: any) => this.formatLogForRpc(log)) || [],
      logsBloom: receipt.logsBloom || '0x',
      status: `0x${receipt.status.toString(16)}`,
    };
  }

  /**
   * Formats log for JSON-RPC response.
   */
  private formatLogForRpc(log: any) {
    return {
      address: log.address,
      topics: log.topics || [],
      data: log.data || '0x',
      blockNumber: `0x${log.blockNumber.toString(16)}`,
      transactionHash: log.transactionHash,
      transactionIndex: log.transactionIndex
        ? `0x${log.transactionIndex.toString(16)}`
        : '0x0',
      blockHash: log.blockHash,
      logIndex: log.index ? `0x${log.index.toString(16)}` : '0x0',
      removed: log.removed || false,
    };
  }
}
