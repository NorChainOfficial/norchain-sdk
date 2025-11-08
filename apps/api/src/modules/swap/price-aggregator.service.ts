import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ethers } from 'ethers';

@Injectable()
export class PriceAggregatorService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    chainId: number,
  ) {
    // Check cache first
    const cacheKey = `quote:${tokenIn}:${tokenOut}:${amountIn}:${chainId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Aggregate prices from all DEXs
    // This would call actual DEX routers
    const quote = {
      amountOut: '100',
      amountOutMin: '98',
      priceImpact: 0.5,
      gasEstimate: '0.0001',
      route: [tokenIn, tokenOut],
    };

    // Cache for 10 seconds
    await this.cacheManager.set(cacheKey, quote, 10000);

    return quote;
  }
}
