import { Test, TestingModule } from '@nestjs/testing';
import { SwapService } from './swap.service';

describe('SwapService', () => {
  let service: SwapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwapService],
    }).compile();

    service = module.get<SwapService>(SwapService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeSwap', () => {
    it('should execute swap and return result', async () => {
      const swapData = {
        quoteId: 'quote-123',
        signedTx: '0x1234567890abcdef',
        userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      };

      const result = await service.executeSwap(swapData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('txHash');
    });
  });
});

