import { Test, TestingModule } from '@nestjs/testing';
import { PriceAggregatorService } from './price-aggregator.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('PriceAggregatorService', () => {
  let service: PriceAggregatorService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceAggregatorService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<PriceAggregatorService>(PriceAggregatorService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuote', () => {
    it('should return cached quote if available', async () => {
      const tokenIn = 'NOR';
      const tokenOut = 'USDT';
      const amountIn = '1000';
      const chainId = 65001;

      const cachedQuote = {
        amountOut: '100',
        amountOutMin: '98',
        priceImpact: 0.5,
        gasEstimate: '0.0001',
        route: [tokenIn, tokenOut],
      };

      cacheManager.get.mockResolvedValue(cachedQuote);

      const result = await service.getQuote(tokenIn, tokenOut, amountIn, chainId);

      expect(result).toEqual(cachedQuote);
      expect(cacheManager.get).toHaveBeenCalled();
    });

    it('should generate new quote if not cached', async () => {
      const tokenIn = 'NOR';
      const tokenOut = 'USDT';
      const amountIn = '1000';
      const chainId = 65001;

      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.getQuote(tokenIn, tokenOut, amountIn, chainId);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('amountOut');
      expect(result).toHaveProperty('route');
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });
});

