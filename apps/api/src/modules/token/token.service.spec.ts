import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenMetadata } from './entities/token-metadata.entity';
import { TokenTransfer } from './entities/token-transfer.entity';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('TokenService', () => {
  let service: TokenService;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;
  let tokenMetadataRepository: jest.Mocked<Repository<TokenMetadata>>;
  let tokenTransferRepository: jest.Mocked<Repository<TokenTransfer>>;

  beforeEach(async () => {
    const mockRpcService = {
      call: jest.fn(),
      getBlock: jest.fn(),
      getBlockNumber: jest.fn(),
      getBalance: jest.fn(),
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
      getTransactionCount: jest.fn(),
      getFeeData: jest.fn(),
      getLogs: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      getOrSet: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const mockTokenMetadataRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockTokenTransferRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: getRepositoryToken(TokenMetadata),
          useValue: mockTokenMetadataRepository,
        },
        {
          provide: getRepositoryToken(TokenTransfer),
          useValue: mockTokenTransferRepository,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
    tokenMetadataRepository = module.get(getRepositoryToken(TokenMetadata));
    tokenTransferRepository = module.get(getRepositoryToken(TokenTransfer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokenSupply', () => {
    it('should return token supply from RPC', async () => {
      const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const supply = BigInt('1000000000000000000');

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.call.mockResolvedValue('0x' + supply.toString(16));
        return fn();
      });

      const result = await service.getTokenSupply(contractAddress);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe(supply.toString());
      expect(rpcService.call).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.call.mockRejectedValue(new Error('RPC error'));
        return fn();
      });

      const result = await service.getTokenSupply(contractAddress);

      expect(result.status).toBe('0');
      expect(result.message).toBeDefined();
    });
  });

  describe('getTokenAccountBalance', () => {
    it('should return token balance for account', async () => {
      const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      const balance = BigInt('1000000000000000000');

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.call.mockResolvedValue('0x' + balance.toString(16));
        return fn();
      });

      const result = await service.getTokenAccountBalance(contractAddress, address);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe(balance.toString());
      expect(rpcService.call).toHaveBeenCalled();
    });
  });

  describe('getTokenInfo', () => {
    it('should return token info from cache or RPC', async () => {
      const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const tokenInfo = {
        address: contractAddress,
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000000000000000',
        tokenType: 'ERC20',
      };

      cacheService.getOrSet.mockResolvedValue(tokenInfo);

      const result = await service.getTokenInfo(contractAddress);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toEqual(tokenInfo);
    });
  });

  describe('getTokenTransfers', () => {
    it('should return token transfers with pagination', async () => {
      const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const page = 1;
      const limit = 10;

      const mockTransfers = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      tokenTransferRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      const result = await service.getTokenTransfers(contractAddress, page, limit);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
    });
  });
});
