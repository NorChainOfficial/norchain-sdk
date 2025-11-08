import { Test, TestingModule } from '@nestjs/testing';
import { SwapController } from './swap.controller';
import { SwapService } from './swap.service';
import { PriceAggregatorService } from './price-aggregator.service';

describe('SwapController', () => {
  let controller: SwapController;
  let swapService: jest.Mocked<SwapService>;
  let priceAggregator: jest.Mocked<PriceAggregatorService>;

  beforeEach(async () => {
    const mockSwapService = {
      executeSwap: jest.fn(),
    };
    const mockPriceAggregator = {
      getQuote: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwapController],
      providers: [
        {
          provide: SwapService,
          useValue: mockSwapService,
        },
        {
          provide: PriceAggregatorService,
          useValue: mockPriceAggregator,
        },
      ],
    }).compile();

    controller = module.get<SwapController>(SwapController);
    swapService = module.get(SwapService);
    priceAggregator = module.get(PriceAggregatorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getQuote', () => {
    it('should return swap quote', async () => {
      const dto = {
        tokenIn: '0x123',
        tokenOut: '0x456',
        amountIn: '1000',
        chainId: 1,
      };
      const mockQuote = {
        amountOut: '100',
        amountOutMin: '98',
        priceImpact: 0.5,
        gasEstimate: '0.0001',
        route: [dto.tokenIn, dto.tokenOut],
      };
      priceAggregator.getQuote.mockResolvedValue(mockQuote as any);

      const result = await controller.getQuote(dto);

      expect(result).toEqual(mockQuote);
      expect(priceAggregator.getQuote).toHaveBeenCalledWith(dto.tokenIn, dto.tokenOut, dto.amountIn, dto.chainId);
    });
  });

  describe('executeSwap', () => {
    it('should execute swap', async () => {
      const dto = {
        tokenIn: '0x123',
        tokenOut: '0x456',
        amountIn: '1000',
        amountOutMin: '900',
        userAddress: '0x789',
      };
      const mockResponse = { success: true, txHash: '0xabc123' };
      swapService.executeSwap.mockResolvedValue(mockResponse as any);

      const result = await controller.executeSwap(dto);

      expect(result).toEqual(mockResponse);
      expect(swapService.executeSwap).toHaveBeenCalledWith(dto);
    });
  });
});

