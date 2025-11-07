import { Controller, Post, Body, Get, Query } from "@nestjs/common";
import { SwapService } from "./swap.service";
import { PriceAggregatorService } from "./price-aggregator.service";

@Controller("api/swap")
export class SwapController {
  constructor(
    private readonly swapService: SwapService,
    private readonly priceAggregator: PriceAggregatorService
  ) {}

  @Post("quote")
  async getQuote(@Body() body: any) {
    const { tokenIn, tokenOut, amountIn, chainId } = body;
    return this.priceAggregator.getQuote(tokenIn, tokenOut, amountIn, chainId);
  }

  @Post("execute")
  async executeSwap(@Body() body: any) {
    return this.swapService.executeSwap(body);
  }
}

