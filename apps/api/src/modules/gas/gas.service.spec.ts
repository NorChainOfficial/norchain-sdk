import { Test, TestingModule } from '@nestjs/testing';
import { GasService } from './gas.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

describe('GasService', () => {
  let service: GasService;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockRpcService = {
      getFeeData: jest.fn(),
      getBlockNumber: jest.fn(),
      getBlock: jest.fn(),
      estimateGas: jest.fn(),
      getProvider: jest.fn(),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GasService,
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<GasService>(GasService);
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGasOracle', () => {
    it('should return gas oracle data', async () => {
      const mockFeeData = {
        gasPrice: BigInt('20000000000'),
        maxFeePerGas: BigInt('20000000000'),
        maxPriorityFeePerGas: BigInt('1000000000'),
        toJSON: jest.fn(),
      } as any;

      const mockBlock = {
        gasUsed: BigInt('500000'),
        gasLimit: BigInt('1000000'),
      } as any;

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getFeeData.mockResolvedValue(mockFeeData);
        rpcService.getBlockNumber.mockResolvedValue(12345);
        rpcService.getBlock.mockResolvedValue(mockBlock);
        return fn();
      });

      const result = await service.getGasOracle();

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('SafeGasPrice');
      expect(result.result).toHaveProperty('ProposeGasPrice');
      expect(result.result).toHaveProperty('FastGasPrice');
    });
  });

  describe('estimateGas', () => {
    it('should estimate gas for transaction', async () => {
      const transaction = {
        to: '0x123',
        from: '0x456',
        value: '1000000000000000000',
      };

      const gasEstimate = BigInt('21000');
      rpcService.estimateGas.mockResolvedValue(gasEstimate);

      const result = await service.estimateGas(transaction);

      expect(result.status).toBe('1');
      expect(result.result.gasEstimate).toBe(gasEstimate.toString());
    });

    it('should return error if estimation fails', async () => {
      const transaction = {
        to: '0x123',
      };

      rpcService.estimateGas.mockRejectedValue(new Error('Estimation failed'));

      const result = await service.estimateGas(transaction);

      expect(result.status).toBe('0');
      expect(result.message).toContain('failed');
    });
  });
});

