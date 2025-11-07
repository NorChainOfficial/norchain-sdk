import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SwapService } from "./swap.service";
import { PriceAggregatorService } from "./price-aggregator.service";
import { GetQuoteDto } from "./dto/get-quote.dto";
import { ExecuteSwapDto } from "./dto/execute-swap.dto";
import { Public } from "@/common/decorators/public.decorator";

@ApiTags('Swap')
@Controller("swap")
export class SwapController {
  constructor(
    private readonly swapService: SwapService,
    private readonly priceAggregator: PriceAggregatorService
  ) {}

  @Public()
  @Post("quote")
  @ApiOperation({ summary: 'Get swap quote' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  async getQuote(@Body() dto: GetQuoteDto) {
    const { tokenIn, tokenOut, amountIn, chainId } = dto;
    return this.priceAggregator.getQuote(tokenIn, tokenOut, amountIn, chainId);
  }

  @Public()
  @Post("execute")
  @ApiOperation({ summary: 'Execute swap' })
  @ApiResponse({ status: 200, description: 'Swap executed successfully' })
  async executeSwap(@Body() dto: ExecuteSwapDto) {
    return this.swapService.executeSwap(dto);
  }
}

