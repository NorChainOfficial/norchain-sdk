import { Test, TestingModule } from '@nestjs/testing';
import { GasPredictionService } from './gas-prediction.service';
import { ProxyService } from '../../proxy/proxy.service';

describe('GasPredictionService', () => {
  let service: GasPredictionService;
  let proxyService: jest.Mocked<ProxyService>;

  beforeEach(async () => {
    const mockProxyService = {
      eth_gasPrice: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GasPredictionService,
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
      ],
    }).compile();

    service = module.get<GasPredictionService>(GasPredictionService);
    proxyService = module.get(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('predict', () => {
    it('should predict gas price', async () => {
      proxyService.eth_gasPrice.mockResolvedValue({
        status: '1',
        result: '0x3b9aca00',
      });

      const result = await service.predict();

      expect(result).toHaveProperty('predictedPrice');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('trend');
      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('historicalData');
    });

    it('should handle missing gas price', async () => {
      proxyService.eth_gasPrice.mockResolvedValue({
        status: '1',
        result: '0x0',
      });

      const result = await service.predict();

      expect(result.predictedPrice).toBeDefined();
    });

    it('should handle errors', async () => {
      proxyService.eth_gasPrice.mockRejectedValue(new Error('RPC error'));

      await expect(service.predict()).rejects.toThrow();
    });
  });
});

