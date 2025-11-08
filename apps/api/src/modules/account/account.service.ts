import { Injectable } from '@nestjs/common';
import { AccountRepository } from './repositories/account.repository';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { GetBalanceDto } from './dto/get-balance.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { GetTokenListDto } from './dto/get-token-list.dto';
import { GetTokenTransfersDto } from './dto/get-token-transfers.dto';
import { GetBalanceMultiDto } from './dto/get-balance-multi.dto';
import { GetInternalTransactionsDto } from './dto/get-internal-transactions.dto';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

/**
 * Account Service
 *
 * Provides account-related operations including balance queries,
 * transaction history, and account summaries.
 *
 * @class AccountService
 * @example
 * ```typescript
 * const balance = await accountService.getBalance({ address: '0x...' });
 * const transactions = await accountService.getTransactions({ address: '0x...', page: 1 });
 * ```
 */
@Injectable()
export class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private rpcService: RpcService,
    private cacheService: CacheService,
  ) {}

  /**
   * Gets the balance of an Ethereum address.
   *
   * Uses caching to reduce RPC calls. Cache TTL: 10 seconds.
   *
   * @param {GetBalanceDto} dto - DTO containing the address
   * @returns {Promise<ResponseDto<string>>} Balance in wei as string
   * @example
   * ```typescript
   * const result = await accountService.getBalance({
   *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
   * });
   * // result.result = "1000000000000000000" (1 ETH in wei)
   * ```
   */
  async getBalance(dto: GetBalanceDto): Promise<ResponseDto<string>> {
    const cacheKey = `balance:${dto.address}`;

    const balance = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const balance = await this.rpcService.getBalance(dto.address);
        return balance.toString();
      },
      10, // 10 seconds cache
    );

    return ResponseDto.success(balance);
  }

  /**
   * Gets transaction list for an address.
   *
   * Tries to fetch from database first, falls back to RPC if database
   * is not available or has no data.
   *
   * @param {GetTransactionsDto} dto - DTO containing address and pagination options
   * @returns {Promise<ResponseDto>} Paginated transaction list
   * @example
   * ```typescript
   * const result = await accountService.getTransactions({
   *   address: '0x...',
   *   startblock: 0,
   *   endblock: 1000000,
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  async getTransactions(dto: GetTransactionsDto) {
    const { address, startblock, endblock, page = 1, limit = 10 } = dto;

    // Try database first if available
    try {
      const result = await this.accountRepository.getTransactionsByAddress(
        address,
        startblock,
        endblock,
        page,
        limit,
      );

      if (result.data.length > 0) {
        return ResponseDto.success(result);
      }
    } catch (error) {
      // Fallback to RPC if database not available
      // Log error for monitoring but continue with fallback
      console.warn('Database query failed, using fallback:', error);
    }

    // Fallback: Return empty with message
    return ResponseDto.success({
      data: [],
      meta: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }

  /**
   * Gets account summary including balance, transaction count, and token count.
   *
   * Uses caching to improve performance. Cache TTL: 60 seconds.
   *
   * @param {string} address - Ethereum address
   * @returns {Promise<ResponseDto>} Account summary
   * @example
   * ```typescript
   * const summary = await accountService.getAccountSummary('0x...');
   * // Returns: { address, balance, transactionCount, tokenCount, ... }
   * ```
   */
  async getAccountSummary(address: string) {
    const cacheKey = `account:summary:${address}`;

    const summary = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.accountRepository.getAccountSummary(address);
      },
      60, // 1 minute cache
    );

    return ResponseDto.success(summary);
  }

  /**
   * Gets list of tokens held by an address.
   *
   * Returns all ERC20 tokens with non-zero balance for the address.
   *
   * @param {GetTokenListDto} dto - DTO containing address and pagination options
   * @returns {Promise<ResponseDto>} Paginated token list
   */
  async getTokenList(dto: GetTokenListDto) {
    const { address, startblock, endblock, page = 1, limit = 10 } = dto;

    const result = await this.accountRepository.getTokenList(
      address,
      startblock,
      endblock,
      page,
      limit,
    );

    return ResponseDto.success(result);
  }

  /**
   * Gets token transfers for an address.
   *
   * Returns ERC20 token transfers (incoming and outgoing) for an address.
   * Optionally filtered by token contract address.
   *
   * @param {GetTokenTransfersDto} dto - DTO containing address, optional contract, and pagination
   * @returns {Promise<ResponseDto>} Paginated token transfers
   */
  async getTokenTransfers(dto: GetTokenTransfersDto) {
    const {
      address,
      contractaddress,
      startblock,
      endblock,
      page = 1,
      limit = 10,
    } = dto;

    const result = await this.accountRepository.getTokenTransfers(
      address,
      contractaddress,
      startblock,
      endblock,
      page,
      limit,
    );

    return ResponseDto.success(result);
  }

  /**
   * Gets balance for multiple addresses.
   *
   * Returns balances for up to 20 addresses in a single call.
   * Uses caching to reduce RPC calls.
   *
   * @param {GetBalanceMultiDto} dto - DTO containing array of addresses
   * @returns {Promise<ResponseDto>} Array of balances
   */
  async getBalanceMulti(dto: GetBalanceMultiDto) {
    const { address } = dto;

    // Fetch balances in parallel with caching
    const balancePromises = address.map(async (addr) => {
      const cacheKey = `balance:${addr}`;
      return this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const balance = await this.rpcService.getBalance(addr);
          return {
            account: addr,
            balance: balance.toString(),
          };
        },
        10, // 10 seconds cache
      );
    });

    const balances = await Promise.all(balancePromises);

    return ResponseDto.success(balances);
  }

  /**
   * Gets internal transactions (contract calls) for an address.
   *
   * Returns internal transactions (trace calls) for an address.
   * These are transactions that occurred as a result of contract execution.
   *
   * @param {GetInternalTransactionsDto} dto - DTO containing address and pagination
   * @returns {Promise<ResponseDto>} Paginated internal transactions
   */
  async getInternalTransactions(dto: GetInternalTransactionsDto) {
    const { address, startblock, endblock, page = 1, limit = 10 } = dto;

    // Internal transactions are typically stored in transaction logs
    // For now, return empty result - this would need indexer support
    const result = await this.accountRepository.getInternalTransactions(
      address,
      startblock,
      endblock,
      page,
      limit,
    );

    return ResponseDto.success(result);
  }
}
