import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('StatsController', () => {
  let controller: StatsController;
  let service: jest.Mocked<StatsService>;

  beforeEach(async () => {
    const mockStatsService = {
      getEthSupply: jest.fn(),
      getEthPrice: jest.fn(),
      getChainSize: jest.fn(),
      getNodeCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: mockStatsService,
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get(StatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEthSupply', () => {
    it('should return supply stats', async () => {
      const mockResponse = ResponseDto.success({
        EthSupply: '1000000',
        Eth2Staking: '0',
        EthBurntFees: '0',
      });
      service.getEthSupply.mockResolvedValue(mockResponse);

      const result = await controller.getEthSupply();

      expect(result).toEqual(mockResponse);
      expect(service.getEthSupply).toHaveBeenCalled();
    });
  });

  describe('getEthPrice', () => {
    it('should return price stats', async () => {
      const mockResponse = ResponseDto.success({
        ethbtc: '0.05',
        ethbtc_timestamp: '1234567890',
        ethusd: '2000',
        ethusd_timestamp: '1234567890',
      });
      service.getEthPrice.mockResolvedValue(mockResponse);

      const result = await controller.getEthPrice();

      expect(result).toEqual(mockResponse);
      expect(service.getEthPrice).toHaveBeenCalled();
    });
  });

  describe('getChainSize', () => {
    it('should return chain size', async () => {
      const mockResponse = ResponseDto.success({
        chainSize: '1000',
        chainSizeFees: '500',
        blockNumber: '12345',
        blockTime: '2024-01-01T00:00:00Z',
      });
      service.getChainSize.mockResolvedValue(mockResponse);

      const result = await controller.getChainSize();

      expect(result).toEqual(mockResponse);
      expect(service.getChainSize).toHaveBeenCalled();
    });
  });

  describe('getNodeCount', () => {
    it('should return node count', async () => {
      const mockResponse = ResponseDto.success({
        TotalNodeCount: '10',
        SyncNodeCount: '8',
      });
      service.getNodeCount.mockResolvedValue(mockResponse);

      const result = await controller.getNodeCount();

      expect(result).toEqual(mockResponse);
      expect(service.getNodeCount).toHaveBeenCalled();
    });
  });
});

