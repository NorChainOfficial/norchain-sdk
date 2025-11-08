import { Test, TestingModule } from '@nestjs/testing';
import { ContractAuditService } from './contract-audit.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../../proxy/proxy.service';
import { of } from 'rxjs';

describe('ContractAuditService', () => {
  let service: ContractAuditService;
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
      eth_getCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractAuditService,
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

    service = module.get<ContractAuditService>(ContractAuditService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
    proxyService = module.get(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('audit', () => {
    it('should return audit for EOA', async () => {
      const address = '0xabc...';
      proxyService.eth_getCode.mockResolvedValue({
        status: '1',
        result: '0x',
        message: 'OK',
      } as any);

      const result = await service.audit(address);

      expect(result.securityScore).toBe(0);
      expect(result.recommendations).toContain('Contract not found or is an EOA');
    });

    it('should audit contract with fallback', async () => {
      const address = '0xabc...';
      proxyService.eth_getCode.mockResolvedValue({
        status: '1',
        result: '0x6080604052...',
      });
      configService.get.mockReturnValue(''); // No AI key

      const result = await service.audit(address);

      expect(result).toHaveProperty('securityScore');
      expect(result).toHaveProperty('vulnerabilities');
      expect(result).toHaveProperty('riskLevel');
    });

    it('should handle AI audit when API key is present', async () => {
      const address = '0xabc...';
      proxyService.eth_getCode.mockResolvedValue({
        status: '1',
        result: '0x6080604052...',
      });
      configService.get.mockReturnValue('test-api-key');
      httpService.post.mockReturnValue(
        of({
          data: {
            content: [
              {
                text: JSON.stringify({
                  securityScore: 85,
                  vulnerabilities: [],
                  recommendations: [],
                  bestPractices: [],
                  riskLevel: 'low',
                }),
              },
            ],
          },
        } as any),
      );

      const result = await service.audit(address);

      expect(result.securityScore).toBe(85);
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const address = '0xabc...';
      proxyService.eth_getCode.mockRejectedValue(new Error('RPC error'));

      await expect(service.audit(address)).rejects.toThrow();
    });
  });
});

