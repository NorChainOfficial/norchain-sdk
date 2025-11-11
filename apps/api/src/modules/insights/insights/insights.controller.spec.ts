import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';

describe('InsightsController', () => {
  let controller: InsightsController;
  let insightsService: jest.Mocked<InsightsService>;

  const mockInsightsService = {
    getTopHolders: jest.fn(),
    getDEXTVL: jest.fn(),
    getGasHeatmap: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [
        {
          provide: InsightsService,
          useValue: mockInsightsService,
        },
      ],
    }).compile();

    controller = module.get<InsightsController>(InsightsController);
    insightsService = module.get(InsightsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTopHolders', () => {
    it('should return top token holders', async () => {
      const tokenAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const limit = 100;

      const mockResult = {
        token: tokenAddress,
        holders: [
          {
            address: '0x123',
            balance: '1000000000000000000000',
            percentage: 50.5,
          },
        ],
        total: 1000,
        limit,
      };

      mockInsightsService.getTopHolders.mockResolvedValue(mockResult);

      const result = await controller.getTopHolders(tokenAddress, limit);

      expect(result).toEqual(mockResult);
      expect(insightsService.getTopHolders).toHaveBeenCalledWith(tokenAddress, limit);
    });

    it('should use default limit when not provided', async () => {
      const tokenAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockResult = { token: tokenAddress, holders: [], total: 0, limit: 100 };

      mockInsightsService.getTopHolders.mockResolvedValue(mockResult);

      await controller.getTopHolders(tokenAddress, 100);

      expect(insightsService.getTopHolders).toHaveBeenCalledWith(tokenAddress, 100);
    });
  });

  describe('getDEXTVL', () => {
    it('should return DEX TVL for specified window', async () => {
      const window = '7d';
      const mockResult = {
        tvl: '10000000000000000000000',
        dataPoints: [
          { timestamp: new Date(), tvl: '10000000000000000000000' },
        ],
      };

      mockInsightsService.getDEXTVL.mockResolvedValue(mockResult);

      const result = await controller.getDEXTVL(window);

      expect(result).toEqual(mockResult);
      expect(insightsService.getDEXTVL).toHaveBeenCalledWith(window);
    });

    it('should handle undefined window', async () => {
      const mockResult = {
        tvl: '10000000000000000000000',
        dataPoints: [],
      };

      mockInsightsService.getDEXTVL.mockResolvedValue(mockResult);

      await controller.getDEXTVL(undefined);

      expect(insightsService.getDEXTVL).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getGasHeatmap', () => {
    it('should return gas usage heatmap', async () => {
      const days = 7;
      const mockResult = {
        heatmap: [
          { hour: 0, day: 0, gasUsed: '1000000' },
          { hour: 1, day: 0, gasUsed: '2000000' },
        ],
      };

      mockInsightsService.getGasHeatmap.mockResolvedValue(mockResult);

      const result = await controller.getGasHeatmap(days);

      expect(result).toEqual(mockResult);
      expect(insightsService.getGasHeatmap).toHaveBeenCalledWith(days);
    });

    it('should use default days when not provided', async () => {
      const mockResult = { heatmap: [] };

      mockInsightsService.getGasHeatmap.mockResolvedValue(mockResult);

      await controller.getGasHeatmap(7);

      expect(insightsService.getGasHeatmap).toHaveBeenCalledWith(7);
    });
  });
});

