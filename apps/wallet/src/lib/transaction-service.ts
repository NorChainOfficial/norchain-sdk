/**
 * Transaction Service
 * Handles transaction creation, signing, and broadcasting
 */

import { ethers } from 'ethers';
import { signTransaction } from './crypto';
import {
  getTransactionCount,
  getGasPrice,
  broadcastTransaction,
  waitForTransaction,
  getBalance,
  getTransactionReceipt,
  RPC_CONFIGS,
} from './rpc';
import { WalletService } from './wallet-service';

export interface TransactionRequest {
  to: string;
  value: string; // Amount in ETH
  chain?: string;
  data?: string;
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
}

export class TransactionService {
  private static instance: TransactionService;
  private walletService: WalletService;

  private constructor() {
    this.walletService = WalletService.getInstance();
  }

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  /**
   * Send transaction
   * Requires private key (from mnemonic or session)
   */
  async sendTransaction(
    request: TransactionRequest,
    privateKey: string
  ): Promise<TransactionResult> {
    const wallet = this.walletService.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet found');
    }

    const account = wallet.accounts[0];
    if (!account) {
      throw new Error('No account found');
    }

    const chain = request.chain || 'xaheen';
    const config = RPC_CONFIGS[chain];
    if (!config) {
      throw new Error(`Unknown chain: ${chain}`);
    }

    try {
      // Get transaction count (nonce)
      const nonce = await getTransactionCount(account.address, chain);
      
      // Get gas price
      const gasPrice = await getGasPrice(chain);
      
      // Convert value to wei
      const valueInWei = ethers.parseEther(request.value).toString();

      // Sign transaction
      const signedTx = await signTransaction(
        {
          to: request.to,
          value: valueInWei,
          gasLimit: '21000',
          gasPrice,
          nonce,
          data: request.data,
        },
        privateKey,
        config.chainId
      );

      // Broadcast transaction
      const txHash = await broadcastTransaction(signedTx, chain);

      return {
        hash: txHash,
        from: account.address,
        to: request.to,
        value: request.value,
        status: 'pending',
      };
    } catch (error: any) {
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    txHash: string,
    chain: string = 'xaheen'
  ): Promise<TransactionResult> {
    try {
      const receipt = await getTransactionReceipt(txHash, chain);
      
      if (!receipt) {
        return {
          hash: txHash,
          from: '',
          to: '',
          value: '0',
          status: 'pending',
        };
      }

      return {
        hash: txHash,
        from: receipt.from,
        to: receipt.to || '',
        value: receipt.value.toString(),
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        confirmations: receipt.confirmations,
      };
    } catch (error: any) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(
    address: string,
    chain: string = 'xaheen'
  ): Promise<string> {
    try {
      return await getBalance(address, chain);
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(
    txHash: string,
    chain: string = 'xaheen'
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      return await getTransactionReceipt(txHash, chain);
    } catch (error: any) {
      throw new Error(`Failed to get transaction receipt: ${error.message}`);
    }
  }
}

