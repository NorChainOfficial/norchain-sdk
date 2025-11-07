import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenService } from './token.service';
import { TokenMetadata } from './entities/token-metadata.entity';
import { TokenHolder } from './entities/token-holder.entity';
import { TokenTransfer } from './entities/token-transfer.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ethers } from 'ethers';

describe('TokenService', () => {
  let service: TokenService;
  let tokenMetadataRepository: any;
  let tokenHolderRepository: any;
  let tokenTransferRepository: any;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockTokenMetadataRepository = {
      findOne: jest.fn(),
    };

    const mockTokenHolderRepository = {
      findOne: jest.fn(),
    };

    const mockTokenTransferRepository = {
      createQueryBuilder: jest.fn(),
    };

    const mockRpcService = {
      getProvider: jest.fn().mockReturnValue({
        call: jest.fn(),
      }),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getRepositoryToken(TokenMetadata),
          useValue: mockTokenMetadataRepository,
        },
        {
          provide: getRepositoryToken(TokenHolder),
          useValue: mockTokenHolderRepository,
        },
        {
          provide: getRepositoryToken(TokenTransfer),
          useValue: mockTokenTransferRepository,
        },
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

    service = module.get<TokenService>(TokenService);
    tokenMetadataRepository = module.get(getRepositoryToken(TokenMetadata));
    tokenHolderRepository = module.get(getRepositoryToken(TokenHolder));
    tokenTransferRepository = module.get(getRepositoryToken(TokenTransfer));
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokenSupply', () => {
    it('should return supply from database', async () => {
      const contractAddress = '0x123';
      const mockMetadata = {
        address: contractAddress,
        totalSupply: '1000000000000000000',
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        tokenMetadataRepository.findOne.mockResolvedValue(mockMetadata);
        return fn();
      });

      const result = await service.getTokenSupply(contractAddress);

      expect(result.status).toBe('1');
      expect(result.result).toBe(mockMetadata.totalSupply);
    });

    it('should return supply from RPC if not in database', async () => {
      const contractAddress = '0x123';
      const totalSupply = BigInt('1000000000000000000');

      const mockContract = {
        totalSupply: jest.fn().mockResolvedValue(totalSupply),
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        tokenMetadataRepository.findOne.mockResolvedValue(null);
        const provider = rpcService.getProvider();
        (provider as any).call = jest.fn().mockResolvedValue(
          ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [totalSupply]),
        );
        return fn();
      });

      const result = await service.getTokenSupply(contractAddress);

      expect(result.status).toBe('1');
    });
  });

  describe('getTokenAccountBalance', () => {
    it('should return balance from database', async () => {
      const contractAddress = '0x123';
      const address = '0x456';
      const mockHolder = {
        tokenAddress: contractAddress,
        holderAddress: address,
        balance: '1000000000000000000',
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        tokenHolderRepository.findOne.mockResolvedValue(mockHolder);
        return fn();
      });

      const result = await service.getTokenAccountBalance(contractAddress, address);

      expect(result.status).toBe('1');
      expect(result.result).toBe(mockHolder.balance);
    });
  });

  describe('getTokenInfo', () => {
    it('should return token info from database', async () => {
      const contractAddress = '0x123';
      const mockMetadata = {
        address: contractAddress,
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000000000000000',
        tokenType: 'ERC20',
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        tokenMetadataRepository.findOne.mockResolvedValue(mockMetadata);
        return fn();
      });

      const result = await service.getTokenInfo(contractAddress);

      expect(result.status).toBe('1');
      expect(result.result).toEqual(mockMetadata);
    });
  });

  describe('getTokenTransfers', () => {
    it('should return paginated token transfers', async () => {
      const contractAddress = '0x123';
      const page = 1;
      const limit = 10;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      tokenTransferRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTokenTransfers(contractAddress, page, limit);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      if (result.result) {
        expect(result.result.meta.page).toBe(page);
        expect(result.result.meta.limit).toBe(limit);
      }
    });
  });
});

