import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';
import { BroadcastTransactionDto } from './dto/broadcast-transaction.dto';

/**
 * Transaction Service
 *
 * Provides transaction-related operations including transaction queries,
 * receipt status, and transaction information.
 */
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private rpcService: RpcService,
    private cacheService: CacheService,
  ) {}

  /**
   * Gets transaction information by hash.
   *
   * @param {string} txhash - Transaction hash
   * @returns {Promise<ResponseDto>} Transaction information
   */
  async getTransaction(txhash: string) {
    const cacheKey = `tx:${txhash}`;

    const transaction = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Try database first
        const dbTx = await this.transactionRepository.findOne({
          where: { hash: txhash },
          relations: ['block', 'logs'],
        });

        if (dbTx) {
          return this.formatTransaction(dbTx);
        }

        // Fallback to RPC
        const rpcTx = await this.rpcService.getTransaction(txhash);
        if (!rpcTx) {
          return null;
        }

        const receipt = await this.rpcService.getTransactionReceipt(txhash);
        return this.formatRpcTransaction(rpcTx, receipt);
      },
      60, // 1 minute cache
    );

    if (!transaction) {
      return ResponseDto.error('Transaction not found');
    }

    return ResponseDto.success(transaction);
  }

  /**
   * Gets transaction receipt status.
   *
   * @param {string} txhash - Transaction hash
   * @returns {Promise<ResponseDto>} Transaction receipt status
   */
  async getTxReceiptStatus(txhash: string) {
    const cacheKey = `tx:receipt:${txhash}`;

    const status = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Try database first
        const dbTx = await this.transactionRepository.findOne({
          where: { hash: txhash },
        });

        if (dbTx && dbTx.status !== null) {
          return {
            status: dbTx.status === 1 ? '1' : '0',
            message: dbTx.status === 1 ? 'Pass' : 'Fail',
          };
        }

        // Fallback to RPC
        const receipt = await this.rpcService.getTransactionReceipt(txhash);
        if (!receipt) {
          return null;
        }

        return {
          status: receipt.status === 1 ? '1' : '0',
          message: receipt.status === 1 ? 'Pass' : 'Fail',
        };
      },
      60,
    );

    if (!status) {
      return ResponseDto.error('Transaction not found');
    }

    return ResponseDto.success(status);
  }

  /**
   * Gets transaction status (pending, confirmed, failed).
   *
   * @param {string} txhash - Transaction hash
   * @returns {Promise<ResponseDto>} Transaction status
   */
  async getStatus(txhash: string) {
    const transaction = await this.rpcService.getTransaction(txhash);

    if (!transaction) {
      return ResponseDto.error('Transaction not found');
    }

    // Check if transaction is pending
    if (!transaction.blockNumber) {
      return ResponseDto.success({
        isError: '0',
        errDescription: '',
        status: 'pending',
      });
    }

    // Get receipt to check status
    const receipt = await this.rpcService.getTransactionReceipt(txhash);
    const isError = receipt && receipt.status === 0 ? '1' : '0';

    return ResponseDto.success({
      isError,
      errDescription: isError === '1' ? 'Transaction failed' : '',
      status: 'confirmed',
    });
  }

  /**
   * Formats database transaction to API format.
   */
  private formatTransaction(tx: Transaction) {
    return {
      blockNumber: tx.blockNumber.toString(),
      timeStamp: tx.block?.timestamp?.toString() || '0',
      hash: tx.hash,
      nonce: tx.nonce.toString(),
      blockHash: tx.blockHash,
      transactionIndex: tx.transactionIndex.toString(),
      from: tx.fromAddress,
      to: tx.toAddress || '',
      value: tx.value,
      gas: tx.gas.toString(),
      gasPrice: tx.gasPrice || '0',
      gasUsed: tx.gasUsed?.toString() || '0',
      isError: tx.status === 0 ? '1' : '0',
      txreceipt_status: tx.status?.toString() || '0',
      input: tx.inputData || '0x',
      contractAddress: tx.contractAddress || '',
      cumulativeGasUsed: '0',
      confirmations: '0',
    };
  }

  /**
   * Formats RPC transaction to API format.
   */
  private formatRpcTransaction(tx: any, receipt: any) {
    return {
      blockNumber: tx.blockNumber?.toString() || '0',
      timeStamp: tx.blockNumber ? '0' : '0', // Would need block timestamp
      hash: tx.hash,
      nonce: tx.nonce.toString(),
      blockHash: tx.blockHash || '',
      transactionIndex: tx.index?.toString() || '0',
      from: tx.from,
      to: tx.to || '',
      value: tx.value.toString(),
      gas: tx.gasLimit.toString(),
      gasPrice: tx.gasPrice?.toString() || '0',
      gasUsed: receipt?.gasUsed?.toString() || '0',
      isError: receipt && receipt.status === 0 ? '1' : '0',
      txreceipt_status: receipt?.status?.toString() || '0',
      input: tx.data || '0x',
      contractAddress: receipt?.contractAddress || '',
      cumulativeGasUsed: receipt?.cumulativeGasUsed?.toString() || '0',
      confirmations: '0',
    };
  }

  /**
   * Broadcasts a signed transaction to the network.
   *
   * @param {BroadcastTransactionDto} dto - DTO containing the signed transaction
   * @returns {Promise<ResponseDto>} Transaction hash and status
   */
  async broadcastTransaction(dto: BroadcastTransactionDto) {
    try {
      const response = await this.rpcService.broadcastTransaction(
        dto.signedTransaction,
      );

      return ResponseDto.success({
        hash: response.hash,
        from: response.from,
        to: response.to,
        value: response.value.toString(),
        gasLimit: response.gasLimit.toString(),
        gasPrice: response.gasPrice?.toString() || '0',
        nonce: response.nonce,
        status: 'pending',
        message: 'Transaction broadcast successfully',
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || 'Failed to broadcast transaction',
      );
    }
  }
}
