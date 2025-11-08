import { Test, TestingModule } from '@nestjs/testing';
import { TransactionAnalysisService } from './transaction-analysis.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../../proxy/proxy.service';
import { of } from 'rxjs';

describe('TransactionAnalysisService', () => {
  let service: TransactionAnalysisService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;
  let proxyService: jest.Mocked<ProxyService>;

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };
    const mockConfigService = {
      get: jest.fn(),
    };
    const mockProxyService = {
      eth_getTransactionByHash: jest.fn(),
      eth_getTransactionReceipt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionAnalysisService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
      ],
    }).compile();

    service = module.get<TransactionAnalysisService>(TransactionAnalysisService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
    proxyService = module.get(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyze', () => {
    it('should analyze transaction with fallback', async () => {
      const txHash = '0x123...';
      proxyService.eth_getTransactionByHash.mockResolvedValue({
        status: '1',
        message: 'OK',
        result: {
          hash: '0xabc123',
          blockNumber: '0x12345',
          blockHash: '0xdef456',
          transactionIndex: '0x0',
          from: '0xfrom',
          to: '0xto',
          value: '0x0',
          gas: '0x5208',
          gasPrice: '0x3b9aca00',
          input: '0x',
          nonce: '0x1',
        },
      });
      proxyService.eth_getTransactionReceipt.mockResolvedValue({
        status: '1',
        message: 'OK',
        result: {
          gasUsed: '0x5208',
          status: '0x1',
          logs: [],
        },
      });
      configService.get.mockReturnValue(''); // No AI key

      const result = await service.analyze(txHash);

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('gasAnalysis');
    });

    it('should handle AI analysis when API key is present', async () => {
      const txHash = '0x123...';
      proxyService.eth_getTransactionByHash.mockResolvedValue({
        status: '1',
        message: 'OK',
        result: {
          hash: '0xabc123',
          blockNumber: '0x12345',
          blockHash: '0xdef456',
          transactionIndex: '0x0',
          from: '0xfrom',
          to: '0xto',
          value: '0x0',
          gas: '0x5208',
          gasPrice: '0x3b9aca00',
          input: '0x',
          nonce: '0x1',
        },
      });
      proxyService.eth_getTransactionReceipt.mockResolvedValue({
        status: '1',
        message: 'OK',
        result: {
          gasUsed: '0x5208',
          status: '0x1',
          logs: [],
        },
      });
      configService.get.mockReturnValue('test-api-key');
      httpService.post.mockReturnValue(
        of({
          data: {
            content: [
              {
                text: JSON.stringify({
                  summary: 'Test',
                  riskLevel: 'low',
                  confidence: 80,
                  insights: [],
                  recommendations: [],
                  patterns: [],
                  anomalies: [],
                }),
              },
            ],
          },
        } as any),
      );

      const result = await service.analyze(txHash);

      expect(result).toHaveProperty('summary');
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const txHash = '0x123...';
      proxyService.eth_getTransactionByHash.mockRejectedValue(new Error('RPC error'));

      await expect(service.analyze(txHash)).rejects.toThrow();
    });
  });
});

