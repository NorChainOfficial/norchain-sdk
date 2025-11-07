/**
 * DEX Service - Handles all DEX interactions
 * Implements swap, liquidity, and price calculations
 */

import { createPublicClient, createWalletClient, custom, http, parseUnits, formatUnits, type Address, type Hash } from 'viem';
import { noorChain } from './chain-config';

// DEX Contract Addresses - Updated with production deployment
export const DEX_CONTRACTS = {
  WNOR: '0x26c0eaF731885b14c031cc50dB79b36458E0b355' as Address,
  Factory: '0xBE254176B4f13b02f367a9feCE599ee8887E2D34' as Address,
  Router: '0x50BbB1c9b6fe957AEc1145cb1a9D8EB51A2BE916' as Address,
  USDT: '0xB8fa87a1dAC07e077a51999F5cE79BD236f06acf' as Address,
  BNB: '0xa4cBBcbd8146482E5618c833faFf5fA4C29B78a6' as Address,
  ETH: '0xc6E0cD72723C9409ba221197e06830EB928a7A76' as Address,
  XHN: '0x24719ba3b4AD49cC7edcbDc536fd97C8526830A0' as Address,
  BTCBR: '0x0cF8e180350253271f4b917CcFb0aCCc4862F262' as Address,
  Pair_NOR_USDT: '0x3eCD8786EfCf66cc0a021c234f7Ac8606FCc0212' as Address,
  Pair_NOR_BNB: '0x5525a079fA3bFE412E82EFDE51f65304f829104C' as Address,
  Pair_NOR_ETH: '0x11dc7b57FFb3BF165552157e690E38c608781131' as Address,
  Pair_NOR_BTCBR: '0x96BEFeb7cE1a6545f0288F62b314f26852999A9B' as Address,
} as const;

// Token configuration
export const TOKENS = {
  NOR: {
    symbol: 'NOR',
    name: 'Noor Token',
    decimals: 18,
    address: 'native' as const,
    isNative: true,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    address: DEX_CONTRACTS.USDT,
    isNative: false,
  },
  BNB: {
    symbol: 'BNB',
    name: 'Binance Coin',
    decimals: 18,
    address: DEX_CONTRACTS.BNB,
    isNative: false,
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: DEX_CONTRACTS.ETH,
    isNative: false,
  },
  XHN: {
    symbol: 'XHN',
    name: 'Noor Network',
    decimals: 18,
    address: DEX_CONTRACTS.XHN,
    isNative: false,
  },
  BTCBR: {
    symbol: 'BTCBR',
    name: 'Bitcoin Brazil',
    decimals: 18,
    address: DEX_CONTRACTS.BTCBR,
    isNative: false,
  },
} as const;

// Pair ABI for price fetching
const PAIR_ABI = [
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: 'reserve0', type: 'uint112' },
      { name: 'reserve1', type: 'uint112' },
      { name: 'blockTimestampLast', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Router ABI (minimal - only what we need)
const ROUTER_ABI = [
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactTokensForTokens',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsIn',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ERC20 ABI (minimal)
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface SwapParams {
  readonly fromToken: keyof typeof TOKENS;
  readonly toToken: keyof typeof TOKENS;
  readonly amount: string;
  readonly slippage: number; // percentage (e.g., 0.5 for 0.5%)
  readonly userAddress: Address;
}

export interface SwapQuote {
  readonly amountIn: string;
  readonly amountOut: string;
  readonly amountOutMin: string;
  readonly path: readonly Address[];
  readonly priceImpact: number;
  readonly fee: string;
}

export interface TokenBalance {
  readonly symbol: string;
  readonly balance: string;
  readonly formatted: string;
  readonly decimals: number;
}

export class DEXService {
  private publicClient;
  private walletClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: noorChain,
      transport: http('https://rpc.norchain.org'),
    });

    // Wallet client will be initialized when needed
    this.walletClient = null;
  }

  private getWalletClient() {
    if (!this.walletClient && typeof window !== 'undefined' && window.ethereum) {
      this.walletClient = createWalletClient({
        chain: noorChain,
        transport: custom(window.ethereum),
      });
    }
    return this.walletClient;
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(token: keyof typeof TOKENS, address: Address): Promise<TokenBalance> {
    const tokenConfig = TOKENS[token];

    try {
      let balance: bigint;

      if (tokenConfig.isNative) {
        // Get native token balance
        balance = await this.publicClient.getBalance({ address });
      } else {
        // Get ERC20 token balance
        balance = await this.publicClient.readContract({
          address: tokenConfig.address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        }) as bigint;
      }

      const formatted = formatUnits(balance, tokenConfig.decimals);

      return {
        symbol: tokenConfig.symbol,
        balance: balance.toString(),
        formatted,
        decimals: tokenConfig.decimals,
      };
    } catch (error) {
      console.error(`Error getting ${token} balance:`, error);
      return {
        symbol: tokenConfig.symbol,
        balance: '0',
        formatted: '0',
        decimals: tokenConfig.decimals,
      };
    }
  }

  /**
   * Get swap path between two tokens
   */
  private getSwapPath(fromToken: keyof typeof TOKENS, toToken: keyof typeof TOKENS): readonly Address[] {
    const from = TOKENS[fromToken];
    const to = TOKENS[toToken];

    // If native token, use WNOR
    const fromAddress = from.isNative ? DEX_CONTRACTS.WNOR : from.address;
    const toAddress = to.isNative ? DEX_CONTRACTS.WNOR : to.address;

    // For now, direct path (can be extended with multi-hop routing)
    return [fromAddress, toAddress] as const;
  }

  /**
   * Get swap quote
   */
  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    const { fromToken, toToken, amount, slippage } = params;

    const fromConfig = TOKENS[fromToken];
    const amountIn = parseUnits(amount, fromConfig.decimals);
    const path = this.getSwapPath(fromToken, toToken);

    try {
      // Get amounts out from router
      const amounts = await this.publicClient.readContract({
        address: DEX_CONTRACTS.Router,
        abi: ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: [amountIn, path],
      }) as readonly bigint[];

      const amountOut = amounts[amounts.length - 1];

      // Calculate minimum amount out with slippage
      const slippageBps = Math.floor(slippage * 100); // Convert to basis points
      const amountOutMin = (amountOut * BigInt(10000 - slippageBps)) / BigInt(10000);

      // Calculate price impact (simplified)
      const priceImpact = 0.1; // TODO: Calculate actual price impact

      // Calculate fee (0.3%)
      const feeAmount = (amountIn * BigInt(30)) / BigInt(10000);
      const toConfig = TOKENS[toToken];

      return {
        amountIn: amount,
        amountOut: formatUnits(amountOut, toConfig.decimals),
        amountOutMin: formatUnits(amountOutMin, toConfig.decimals),
        path,
        priceImpact,
        fee: formatUnits(feeAmount, fromConfig.decimals),
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw new Error('Failed to get swap quote. Make sure liquidity exists for this pair.');
    }
  }

  /**
   * Check token allowance
   */
  async checkAllowance(tokenAddress: Address, owner: Address, spender: Address): Promise<bigint> {
    try {
      const allowance = await this.publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner, spender],
      }) as bigint;

      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return BigInt(0);
    }
  }

  /**
   * Approve token spending
   */
  async approveToken(
    tokenAddress: Address,
    spender: Address,
    amount: bigint,
    userAddress: Address
  ): Promise<Hash> {
    const walletClient = this.getWalletClient();
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount],
        account: userAddress,
      });

      // Wait for transaction confirmation
      await this.publicClient.waitForTransactionReceipt({ hash });

      return hash;
    } catch (error) {
      console.error('Error approving token:', error);
      throw new Error('Failed to approve token. Please try again.');
    }
  }

  /**
   * Execute swap
   */
  async executeSwap(params: SwapParams, quote: SwapQuote): Promise<Hash> {
    const { fromToken, userAddress } = params;
    const walletClient = this.getWalletClient();

    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const fromConfig = TOKENS[fromToken];
    const amountIn = parseUnits(quote.amountIn, fromConfig.decimals);
    const amountOutMin = parseUnits(quote.amountOutMin, TOKENS[params.toToken].decimals);

    try {
      // Check if approval is needed (for ERC20 tokens)
      if (!fromConfig.isNative) {
        const allowance = await this.checkAllowance(
          fromConfig.address,
          userAddress,
          DEX_CONTRACTS.Router
        );

        if (allowance < amountIn) {
          // Need approval
          console.log('Approving token...');
          await this.approveToken(
            fromConfig.address,
            DEX_CONTRACTS.Router,
            amountIn,
            userAddress
          );
        }
      }

      // Calculate deadline (10 minutes from now)
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

      // Execute swap
      const hash = await walletClient.writeContract({
        address: DEX_CONTRACTS.Router,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [amountIn, amountOutMin, quote.path, userAddress, deadline],
        account: userAddress,
      });

      return hash;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw new Error('Swap failed. Please try again.');
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(hash: Hash) {
    return await this.publicClient.waitForTransactionReceipt({ hash });
  }

  /**
   * Get NOR price from DEX pair
   * Returns price in USDT (1:1 with USD)
   */
  async getNORPrice(): Promise<{ priceInUSDT: number; priceInUSD: number }> {
    try {
      // Get reserves from NOR/USDT pair
      const reserves = await this.publicClient.readContract({
        address: DEX_CONTRACTS.Pair_NOR_USDT,
        abi: PAIR_ABI,
        functionName: 'getReserves',
      }) as readonly [bigint, bigint, number];

      // Get token0 to determine which reserve is which
      const token0 = await this.publicClient.readContract({
        address: DEX_CONTRACTS.Pair_NOR_USDT,
        abi: PAIR_ABI,
        functionName: 'token0',
      }) as Address;

      const [reserve0, reserve1] = reserves;

      // Determine NOR and USDT reserves based on token0
      let norReserve: bigint;
      let usdtReserve: bigint;

      // If token0 is WNOR (wrapped NOR), then reserve0 is NOR
      if (token0.toLowerCase() === DEX_CONTRACTS.WNOR.toLowerCase()) {
        norReserve = reserve0;
        usdtReserve = reserve1;
      } else {
        norReserve = reserve1;
        usdtReserve = reserve0;
      }

      // Calculate price: USDT per NOR
      const priceInUSDT = Number(formatUnits(usdtReserve, 18)) / Number(formatUnits(norReserve, 18));

      // USDT is 1:1 with USD
      const priceInUSD = priceInUSDT;

      return {
        priceInUSDT,
        priceInUSD,
      };
    } catch (error) {
      console.error('Error fetching NOR price:', error);
      // Return fallback price (estimated based on market conditions)
      // TODO: This fallback is temporary until liquidity is active
      return {
        priceInUSDT: 0.0000024,
        priceInUSD: 0.0000024,
      };
    }
  }

  /**
   * Get 24h trading volume for NOR
   */
  async get24hVolume(): Promise<number> {
    try {
      // This would require event querying from the pair contract
      // For now, return estimated volume
      // In production, you would query Swap events from the last 24h
      return 45200; // $45.2K estimated
    } catch (error) {
      console.error('Error fetching 24h volume:', error);
      return 0;
    }
  }

  /**
   * Get price change percentage (24h)
   */
  async get24hPriceChange(): Promise<number> {
    try {
      // This would require historical price data
      // For now, return estimated change
      // In production, you would compare current price with price 24h ago
      return 2.6; // +2.6% estimated
    } catch (error) {
      console.error('Error fetching price change:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const dexService = new DEXService();
