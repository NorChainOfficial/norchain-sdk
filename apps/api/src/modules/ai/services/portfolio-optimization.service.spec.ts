import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioOptimizationService } from './portfolio-optimization.service';
import { TokenService } from '../../token/token.service';

describe('PortfolioOptimizationService', () => {
  let service: PortfolioOptimizationService;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const mockTokenService = {
      getTokenAccountBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioOptimizationService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<PortfolioOptimizationService>(PortfolioOptimizationService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('optimize', () => {
    it('should optimize portfolio', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

      const result = await service.optimize(address);

      expect(result).toHaveProperty('currentPortfolio');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('optimizedAllocation');
      expect(result).toHaveProperty('expectedReturn');
    });

    it('should handle errors', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      tokenService.getTokenAccountBalance.mockRejectedValue(new Error('Service error'));

      await expect(service.optimize(address)).rejects.toThrow();
    });
  });
});

