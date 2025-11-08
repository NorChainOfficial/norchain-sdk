import { Test, TestingModule } from '@nestjs/testing';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { ProxyService } from '../../proxy/proxy.service';
import { TransactionService } from '../../transaction/transaction.service';

describe('AnomalyDetectionService', () => {
  let service: AnomalyDetectionService;
  let proxyService: jest.Mocked<ProxyService>;
  let transactionService: jest.Mocked<TransactionService>;

  beforeEach(async () => {
    const mockProxyService = {
      getBlockNumber: jest.fn(),
    };
    const mockTransactionService = {
      getTransactionsByAddress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnomalyDetectionService,
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    service = module.get<AnomalyDetectionService>(AnomalyDetectionService);
    proxyService = module.get(ProxyService);
    transactionService = module.get(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detect', () => {
    it('should detect anomalies', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const days = 7;

      const result = await service.detect(address, days);

      expect(result).toHaveProperty('anomalies');
      expect(result).toHaveProperty('riskScore');
      expect(result).toHaveProperty('recommendations');
    });

    it('should use default days value', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

      const result = await service.detect(address);

      expect(result).toHaveProperty('anomalies');
    });

    it('should handle errors', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      // Mock the private getRecentTransactions method to throw
      jest.spyOn(service as any, 'getRecentTransactions').mockRejectedValue(new Error('RPC error'));

      await expect(service.detect(address)).rejects.toThrow();
    });
  });
});

