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

    it('should detect high frequency transactions', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const transactions = Array(101).fill({ value: '0' });
      jest.spyOn(service as any, 'getRecentTransactions').mockResolvedValue(transactions);

      const result = await service.detect(address, 7);

      expect(result.anomalies).toHaveLength(1);
      expect(result.anomalies[0].type).toBe('high_frequency');
      expect(result.anomalies[0].severity).toBe('medium');
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should detect large value transfers', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const transactions = [
        { value: '2000000000000000000' }, // 2 ETH
        { value: '500000000000000000' }, // 0.5 ETH
      ];
      jest.spyOn(service as any, 'getRecentTransactions').mockResolvedValue(transactions);

      const result = await service.detect(address, 7);

      expect(result.anomalies).toHaveLength(1);
      expect(result.anomalies[0].type).toBe('large_transfers');
      expect(result.anomalies[0].severity).toBe('high');
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should detect both high frequency and large transfers', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const transactions = Array(101).fill({ value: '2000000000000000000' }); // 101 transactions, each > 1 ETH
      jest.spyOn(service as any, 'getRecentTransactions').mockResolvedValue(transactions);

      const result = await service.detect(address, 7);

      expect(result.anomalies.length).toBeGreaterThanOrEqual(2);
      expect(result.anomalies.some((a) => a.type === 'high_frequency')).toBe(true);
      expect(result.anomalies.some((a) => a.type === 'large_transfers')).toBe(true);
    });

    it('should calculate risk score correctly for different severities', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      jest.spyOn(service as any, 'getRecentTransactions').mockResolvedValue([]);
      
      // Test critical severity
      const criticalAnomalies = [{ type: 'test', severity: 'critical' as const, description: 'test', timestamp: Date.now() }];
      const criticalScore = (service as any).calculateRiskScore(criticalAnomalies);
      expect(criticalScore).toBe(40);

      // Test high severity
      const highAnomalies = [{ type: 'test', severity: 'high' as const, description: 'test', timestamp: Date.now() }];
      const highScore = (service as any).calculateRiskScore(highAnomalies);
      expect(highScore).toBe(25);

      // Test medium severity
      const mediumAnomalies = [{ type: 'test', severity: 'medium' as const, description: 'test', timestamp: Date.now() }];
      const mediumScore = (service as any).calculateRiskScore(mediumAnomalies);
      expect(mediumScore).toBe(15);

      // Test low severity
      const lowAnomalies = [{ type: 'test', severity: 'low' as const, description: 'test', timestamp: Date.now() }];
      const lowScore = (service as any).calculateRiskScore(lowAnomalies);
      expect(lowScore).toBe(5);

      // Test multiple anomalies
      const multipleAnomalies = [
        { type: 'test1', severity: 'critical' as const, description: 'test', timestamp: Date.now() },
        { type: 'test2', severity: 'high' as const, description: 'test', timestamp: Date.now() },
      ];
      const multipleScore = (service as any).calculateRiskScore(multipleAnomalies);
      expect(multipleScore).toBe(65);

      // Test score cap at 100
      const manyAnomalies = Array(10).fill({ type: 'test', severity: 'critical' as const, description: 'test', timestamp: Date.now() });
      const cappedScore = (service as any).calculateRiskScore(manyAnomalies);
      expect(cappedScore).toBe(100);
    });

    it('should generate recommendations correctly', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      jest.spyOn(service as any, 'getRecentTransactions').mockResolvedValue([]);

      // Test high frequency recommendation
      const highFreqAnomalies = [{ type: 'high_frequency', severity: 'medium' as const, description: 'test', timestamp: Date.now() }];
      const highFreqRecs = (service as any).generateRecommendations(highFreqAnomalies);
      expect(highFreqRecs).toContain('Monitor transaction frequency closely');

      // Test large transfers recommendation
      const largeTransfersAnomalies = [{ type: 'large_transfers', severity: 'high' as const, description: 'test', timestamp: Date.now() }];
      const largeTransfersRecs = (service as any).generateRecommendations(largeTransfersAnomalies);
      expect(largeTransfersRecs).toContain('Verify large transfers are authorized');

      // Test no anomalies
      const noAnomalies: any[] = [];
      const noAnomaliesRecs = (service as any).generateRecommendations(noAnomalies);
      expect(noAnomaliesRecs).toContain('No immediate concerns detected');
    });
  });
});

