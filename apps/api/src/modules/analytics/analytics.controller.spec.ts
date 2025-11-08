import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: jest.Mocked<AnalyticsService>;

  beforeEach(async () => {
    const mockAnalyticsService = {
      getPortfolioSummary: jest.fn(),
      getTransactionAnalytics: jest.fn(),
      getNetworkStatistics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPortfolioSummary', () => {
    it('should return portfolio summary', async () => {
      const address = '0x123';
      const mockResponse = ResponseDto.success({
        address,
        nativeBalance: '1000000000000000000',
        transactionStats: { sent: 10, received: 5, total: 15 },
        tokenTransferCount: 3,
        totalValue: { native: '1000000000000000000', tokens: '0', totalUSD: '0' },
        firstTransaction: null,
        lastTransaction: null,
      });
      service.getPortfolioSummary.mockResolvedValue(mockResponse);

      const result = await controller.getPortfolioSummary(address);

      expect(result).toEqual(mockResponse);
      expect(service.getPortfolioSummary).toHaveBeenCalledWith(address);
    });
  });

  describe('getTransactionAnalytics', () => {
    it('should return transaction analytics', async () => {
      const address = '0x123';
      const days = 30;
      const mockResponse = ResponseDto.success({
        address,
        period: '30 days',
        totalTransactions: 10,
        totalSent: '1000000000000000000',
        totalReceived: '2000000000000000000',
        netFlow: '1000000000000000000',
        totalGasUsed: '210000',
        averageGasPerTx: '21000',
        successRate: '100.00',
      });
      service.getTransactionAnalytics.mockResolvedValue(mockResponse);

      const result = await controller.getTransactionAnalytics(address, days);

      expect(result).toEqual(mockResponse);
      expect(service.getTransactionAnalytics).toHaveBeenCalledWith(address, days);
    });
  });

  describe('getNetworkStatistics', () => {
    it('should return network statistics', async () => {
      const mockResponse = ResponseDto.success({
        currentBlock: 12345,
        totalTransactions: 1000,
        recentTransactionCount: 100,
        averageBlockTime: 12,
        networkHashRate: '0',
        activeAddresses: 0,
        totalValueTransferred: '0',
        blockTime: 1234567890,
      });
      service.getNetworkStatistics.mockResolvedValue(mockResponse);

      const result = await controller.getNetworkStatistics();

      expect(result).toEqual(mockResponse);
      expect(service.getNetworkStatistics).toHaveBeenCalled();
    });
  });
});

