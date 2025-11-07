import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountRepository } from './repositories/account.repository';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { GetBalanceDto } from './dto/get-balance.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<AccountRepository>;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockAccountRepository = {
      getTransactionsByAddress: jest.fn(),
      getAccountSummary: jest.fn(),
      getTokenList: jest.fn(),
      getTokenTransfers: jest.fn(),
      getInternalTransactions: jest.fn(),
    };

    const mockRpcService = {
      getBalance: jest.fn(),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: mockAccountRepository,
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

    service = module.get<AccountService>(AccountService);
    accountRepository = module.get(AccountRepository);
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return balance from cache', async () => {
      const dto: GetBalanceDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };
      const cachedBalance = '1000000000000000000';

      cacheService.getOrSet.mockResolvedValue(cachedBalance);

      const result = await service.getBalance(dto);

      expect(result.status).toBe('1');
      expect(result.result).toBe(cachedBalance);
      expect(cacheService.getOrSet).toHaveBeenCalled();
    });

    it('should fetch balance from RPC if not cached', async () => {
      const dto: GetBalanceDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };
      const balance = BigInt('1000000000000000000');

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });
      rpcService.getBalance.mockResolvedValue(balance);

      const result = await service.getBalance(dto);

      expect(result.status).toBe('1');
      expect(result.result).toBe(balance.toString());
      expect(rpcService.getBalance).toHaveBeenCalledWith(dto.address);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions from repository', async () => {
      const dto: GetTransactionsDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };
      const mockTransaction = {
        id: 1,
        hash: '0x123',
        blockNumber: 12345,
        blockHash: '0xabc',
        transactionIndex: 0,
        fromAddress: dto.address,
        toAddress: '0x456',
        value: '1000000000000000000',
        gas: '21000',
        gasPrice: '20000000000',
        gasUsed: '21000',
        nonce: 0,
        inputData: '0x',
        status: 1,
        contractAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResult = {
        data: [mockTransaction],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      accountRepository.getTransactionsByAddress.mockResolvedValue(mockResult as any);

      const result = await service.getTransactions(dto);

      expect(result.status).toBe('1');
      expect(result.result).toEqual(mockResult);
      expect(accountRepository.getTransactionsByAddress).toHaveBeenCalledWith(
        dto.address,
        undefined,
        undefined,
        1,
        10,
      );
    });

    it('should return empty result if repository fails', async () => {
      const dto: GetTransactionsDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };

      accountRepository.getTransactionsByAddress.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.getTransactions(dto);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      if (result.result) {
        expect(result.result.data).toEqual([]);
      }
    });
  });

  describe('getAccountSummary', () => {
    it('should return account summary from cache', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockSummary = {
        address,
        balance: '1000000000000000000',
        transactionCount: 10,
        tokenCount: 5,
      };

      cacheService.getOrSet.mockResolvedValue(mockSummary);

      const result = await service.getAccountSummary(address);

      expect(result.status).toBe('1');
      expect(result.result).toEqual(mockSummary);
    });
  });
});

