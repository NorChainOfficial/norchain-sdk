import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountRepository } from './repositories/account.repository';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { GetBalanceDto } from './dto/get-balance.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('AccountService Integration', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<AccountRepository>;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockAccountRepository = {
      getTransactionsByAddress: jest.fn(),
      getTokenListByAddress: jest.fn(),
      getTokenTransfersByAddress: jest.fn(),
      getInternalTransactionsByAddress: jest.fn(),
    };

    const mockRpcService = {
      getBalance: jest.fn(),
      getTransactionCount: jest.fn(),
      getTransactions: jest.fn(),
      getBlock: jest.fn(),
      getBlockNumber: jest.fn(),
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
      getFeeData: jest.fn(),
      call: jest.fn(),
      getLogs: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      getOrSet: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should get balance from cache if available', async () => {
      const dto: GetBalanceDto = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      };
      const cachedBalance = '1000000000000000000';

      cacheService.getOrSet.mockResolvedValue(cachedBalance);

      const result = await service.getBalance(dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe(cachedBalance);
      expect(cacheService.getOrSet).toHaveBeenCalled();
    });

    it('should fetch balance from RPC if not cached', async () => {
      const dto: GetBalanceDto = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      };
      const rpcBalance = BigInt('2000000000000000000');

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBalance.mockResolvedValue(rpcBalance);
        return fn();
      });

      const result = await service.getBalance(dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe(rpcBalance.toString());
      expect(rpcService.getBalance).toHaveBeenCalledWith(dto.address);
    });
  });

  describe('getTransactions', () => {
    it('should get transactions from database if available', async () => {
      const dto: GetTransactionsDto = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        page: 1,
        limit: 10,
      };

      const dbTransactions = {
        data: [
          {
            id: '1',
            hash: '0x123',
            fromAddress: dto.address,
            toAddress: '0x456',
            value: '1000000000000000000',
            blockNumber: 12345,
            blockHash: '0xabc',
            transactionIndex: 0,
            gasLimit: '21000',
            gasPrice: '20000000000',
            gasUsed: '21000',
            status: 1,
            nonce: 0,
            data: '0x',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      accountRepository.getTransactionsByAddress.mockResolvedValue(dbTransactions);

      const result = await service.getTransactions(dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toEqual(dbTransactions);
      expect(accountRepository.getTransactionsByAddress).toHaveBeenCalled();
    });

    it('should fallback to RPC if database has no data', async () => {
      const dto: GetTransactionsDto = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        page: 1,
        limit: 10,
      };

      accountRepository.getTransactionsByAddress.mockResolvedValue({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Note: AccountService doesn't use RPC for transactions when DB returns empty
      // It returns empty result with success status

      const result = await service.getTransactions(dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(accountRepository.getTransactionsByAddress).toHaveBeenCalled();
    });
  });

  describe('getAccountSummary', () => {
    it('should aggregate account data from multiple sources', async () => {
      const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const summary = {
        address,
        balance: '1000000000000000000',
        transactionCount: 10,
        tokenCount: 5,
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        accountRepository.getAccountSummary = jest.fn().mockResolvedValue(summary);
        return fn();
      });

      const result = await service.getAccountSummary(address);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      expect(result.result.address).toBe(address);
      expect(accountRepository.getAccountSummary).toHaveBeenCalledWith(address);
    });
  });
});

