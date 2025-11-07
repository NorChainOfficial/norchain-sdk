/**
 * Contract Interaction Service
 * Handles blockchain calls, multicall batching, and transaction management
 */

import { ethers, BrowserProvider, Contract as EthersContract } from 'ethers';
import { AbiFunction } from '@/lib/types';

export interface ReadCallResult {
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: string;
}

export interface WriteCallResult {
  readonly success: boolean;
  readonly hash?: string;
  readonly error?: string;
}

export interface GasEstimate {
  readonly gasLimit: bigint;
  readonly gasPrice: bigint;
  readonly estimatedCost: bigint;
  readonly estimatedCostEth: string;
}

export interface SimulationResult {
  readonly success: boolean;
  readonly result?: unknown;
  readonly gasUsed?: bigint;
  readonly error?: string;
}

/**
 * Cache for read contract results
 */
class ReadCache {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly ttl: number = 30000; // 30 seconds

  public get(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  public set(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }
}

export class ContractInteractionService {
  private provider: BrowserProvider | null = null;
  private readCache: ReadCache = new ReadCache();

  constructor(provider?: BrowserProvider) {
    if (provider) {
      this.provider = provider;
    }
  }

  /**
   * Set the provider for contract interactions
   */
  public setProvider(provider: BrowserProvider): void {
    this.provider = provider;
  }

  /**
   * Read from contract (view/pure functions)
   */
  public async readContract(
    contractAddress: string,
    abi: readonly any[],
    functionName: string,
    params: readonly unknown[] = [],
    useCache = true
  ): Promise<ReadCallResult> {
    try {
      // Generate cache key
      const cacheKey = `${contractAddress}-${functionName}-${JSON.stringify(params)}`;

      // Check cache
      if (useCache) {
        const cached = this.readCache.get(cacheKey);
        if (cached !== null) {
          return { success: true, data: cached };
        }
      }

      // Get provider (use default if not set)
      const provider = this.provider || this.getDefaultProvider();
      if (!provider) {
        return {
          success: false,
          error: 'No provider available',
        };
      }

      // Create contract instance
      const contract = new EthersContract(contractAddress, abi, provider);

      // Call function
      const result = await contract[functionName](...params);

      // Cache result
      if (useCache) {
        this.readCache.set(cacheKey, result);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error),
      };
    }
  }

  /**
   * Batch read multiple functions using multicall pattern
   */
  public async batchRead(
    contractAddress: string,
    abi: readonly any[],
    calls: ReadonlyArray<{ functionName: string; params: readonly unknown[] }>
  ): Promise<ReadonlyArray<ReadCallResult>> {
    const results: ReadCallResult[] = [];

    // Execute calls in parallel
    const promises = calls.map((call) =>
      this.readContract(
        contractAddress,
        abi,
        call.functionName,
        call.params,
        true
      )
    );

    const settled = await Promise.allSettled(promises);

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          success: false,
          error: result.reason?.message || 'Call failed',
        });
      }
    }

    return results;
  }

  /**
   * Write to contract (nonpayable/payable functions)
   */
  public async writeContract(
    contractAddress: string,
    abi: readonly any[],
    functionName: string,
    params: readonly unknown[] = [],
    value?: bigint
  ): Promise<WriteCallResult> {
    try {
      if (!this.provider) {
        return {
          success: false,
          error: 'Provider not set. Please connect wallet.',
        };
      }

      // Get signer
      const signer = await this.provider.getSigner();

      // Create contract instance
      const contract = new EthersContract(contractAddress, abi, signer);

      // Prepare transaction options
      const txOptions: { value?: bigint } = {};
      if (value !== undefined && value > 0n) {
        txOptions.value = value;
      }

      // Send transaction
      const tx = await contract[functionName](...params, txOptions);

      // Return transaction hash immediately
      return {
        success: true,
        hash: tx.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error),
      };
    }
  }

  /**
   * Estimate gas for a transaction
   */
  public async estimateGas(
    contractAddress: string,
    abi: readonly any[],
    functionName: string,
    params: readonly unknown[] = [],
    value?: bigint
  ): Promise<GasEstimate | null> {
    try {
      if (!this.provider) {
        return null;
      }

      // Get signer
      const signer = await this.provider.getSigner();

      // Create contract instance
      const contract = new EthersContract(contractAddress, abi, signer);

      // Prepare transaction options
      const txOptions: { value?: bigint } = {};
      if (value !== undefined && value > 0n) {
        txOptions.value = value;
      }

      // Estimate gas
      const gasLimit = await contract[functionName].estimateGas(
        ...params,
        txOptions
      );

      // Get gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;

      // Calculate estimated cost
      const estimatedCost = gasLimit * gasPrice;
      const estimatedCostEth = ethers.formatEther(estimatedCost);

      return {
        gasLimit,
        gasPrice,
        estimatedCost,
        estimatedCostEth,
      };
    } catch (error) {
      console.error('Gas estimation error:', error);
      return null;
    }
  }

  /**
   * Simulate transaction (static call)
   */
  public async simulateTransaction(
    contractAddress: string,
    abi: readonly any[],
    functionName: string,
    params: readonly unknown[] = [],
    value?: bigint
  ): Promise<SimulationResult> {
    try {
      if (!this.provider) {
        return {
          success: false,
          error: 'Provider not set',
        };
      }

      // Get signer
      const signer = await this.provider.getSigner();

      // Create contract instance
      const contract = new EthersContract(contractAddress, abi, signer);

      // Prepare transaction options
      const txOptions: { value?: bigint } = {};
      if (value !== undefined && value > 0n) {
        txOptions.value = value;
      }

      // Use staticCall to simulate
      const result = await contract[functionName].staticCall(
        ...params,
        txOptions
      );

      // Estimate gas
      const gasUsed = await contract[functionName].estimateGas(
        ...params,
        txOptions
      );

      return {
        success: true,
        result,
        gasUsed,
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error),
      };
    }
  }

  /**
   * Wait for transaction confirmation
   */
  public async waitForTransaction(
    txHash: string,
    confirmations = 1
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const provider = this.provider || this.getDefaultProvider();
      if (!provider) {
        return null;
      }

      const receipt = await provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      return null;
    }
  }

  /**
   * Get transaction receipt
   */
  public async getTransactionReceipt(
    txHash: string
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const provider = this.provider || this.getDefaultProvider();
      if (!provider) {
        return null;
      }

      return await provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return null;
    }
  }

  /**
   * Clear read cache
   */
  public clearCache(): void {
    this.readCache.clear();
  }

  /**
   * Get default provider for read-only operations
   */
  private getDefaultProvider(): BrowserProvider | null {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new BrowserProvider(window.ethereum);
    }
    return null;
  }

  /**
   * Parse error message
   */
  private parseError(error: unknown): string {
    if (error instanceof Error) {
      // Check for common error codes
      if ('code' in error) {
        const code = (error as any).code;

        if (code === 'ACTION_REJECTED') {
          return 'Transaction rejected by user';
        }

        if (code === 'INSUFFICIENT_FUNDS') {
          return 'Insufficient funds for transaction';
        }

        if (code === 'NETWORK_ERROR') {
          return 'Network connection error';
        }
      }

      // Check for revert reason
      if ('reason' in error) {
        const reason = (error as any).reason;
        if (reason) {
          return reason;
        }
      }

      // Return error message
      return error.message;
    }

    return 'Unknown error occurred';
  }

  /**
   * Format transaction hash for display
   */
  public static formatTxHash(hash: string): string {
    if (hash.length < 12) {
      return hash;
    }
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  }

  /**
   * Format address for display
   */
  public static formatAddress(address: string): string {
    if (address.length < 12) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Validate contract address
   */
  public static isValidAddress(address: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }
}

/**
 * Transaction queue manager for handling multiple transactions
 */
export class TransactionQueue {
  private queue: Array<{
    id: string;
    contractAddress: string;
    functionName: string;
    params: readonly unknown[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    hash?: string;
    error?: string;
  }> = [];

  public add(
    id: string,
    contractAddress: string,
    functionName: string,
    params: readonly unknown[]
  ): void {
    this.queue.push({
      id,
      contractAddress,
      functionName,
      params,
      status: 'pending',
    });
  }

  public updateStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    hash?: string,
    error?: string
  ): void {
    const item = this.queue.find((q) => q.id === id);
    if (item) {
      item.status = status;
      if (hash) {
        item.hash = hash;
      }
      if (error) {
        item.error = error;
      }
    }
  }

  public getQueue(): ReadonlyArray<{
    readonly id: string;
    readonly contractAddress: string;
    readonly functionName: string;
    readonly params: readonly unknown[];
    readonly status: 'pending' | 'processing' | 'completed' | 'failed';
    readonly hash?: string;
    readonly error?: string;
  }> {
    return [...this.queue];
  }

  public clear(): void {
    this.queue = [];
  }

  public remove(id: string): void {
    this.queue = this.queue.filter((q) => q.id !== id);
  }
}
