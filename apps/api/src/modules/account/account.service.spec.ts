import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountRepository } from './repositories/account.repository';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { GetBalanceDto } from './dto/get-balance.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { GetTokenListDto } from './dto/get-token-list.dto';
import { GetTokenTransfersDto } from './dto/get-token-transfers.dto';
import { GetBalanceMultiDto } from './dto/get-balance-multi.dto';
import { GetInternalTransactionsDto } from './dto/get-internal-transactions.dto';

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

    it('should handle zero balance', async () => {
      const dto: GetBalanceDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });
      rpcService.getBalance.mockResolvedValue(BigInt('0'));

      const result = await service.getBalance(dto);

      expect(result.status).toBe('1');
      expect(result.result).toBe('0');
    });

    it('should handle RPC errors gracefully', async () => {
      const dto: GetBalanceDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });
      rpcService.getBalance.mockRejectedValue(new Error('RPC error'));

      await expect(service.getBalance(dto)).rejects.toThrow('RPC error');
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

    it('should fetch from repository if not cached', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockSummary = {
        address,
        balance: '1000000000000000000',
        transactionCount: 10,
        tokenCount: 5,
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });
      accountRepository.getAccountSummary.mockResolvedValue(mockSummary as any);

      const result = await service.getAccountSummary(address);

      expect(result.status).toBe('1');
      expect(result.result).toEqual(mockSummary);
      expect(accountRepository.getAccountSummary).toHaveBeenCalledWith(address);
    });
  });

  describe('getTokenList', () => {
    it('should return token list', async () => {
      const dto: GetTokenListDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [
          {
            contractAddress: '0x123',
            tokenName: 'Test Token',
            symbol: 'TEST',
            balance: '1000000000000000000',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      accountRepository.getTokenList.mockResolvedValue(mockResult as any);

      const result = await service.getTokenList(dto);

      expect(result.status).toBe('1');
      expect(result.result).toEqual(mockResult);
      expect(accountRepository.getTokenList).toHaveBeenCalledWith(
        dto.address,
        undefined,
        undefined,
        1,
        10,
      );
    });

    it('should handle empty token list', async () => {
      const dto: GetTokenListDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      accountRepository.getTokenList.mockResolvedValue(mockResult as any);

      const result = await service.getTokenList(dto);

      expect(result.result.data).toHaveLength(0);
    });
  });

  describe('getTokenTransfers', () => {
    it('should return token transfers', async () => {
      const dto: GetTokenTransfersDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        contractaddress: '0x123',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [
          {
            fromAddress: '0x456',
            toAddress: dto.address,
            value: '1000000000000000000',
            contractAddress: dto.contractaddress,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      accountRepository.getTokenTransfers.mockResolvedValue(mockResult as any);

      const result = await service.getTokenTransfers(dto);

      expect(result.status).toBe('1');
      expect(result.result).toEqual(mockResult);
      expect(accountRepository.getTokenTransfers).toHaveBeenCalledWith(
        dto.address,
        dto.contractaddress,
        undefined,
        undefined,
        1,
        10,
      );
    });

    it('should handle transfers without contract filter', async () => {
      const dto: GetTokenTransfersDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      accountRepository.getTokenTransfers.mockResolvedValue(mockResult as any);

      await service.getTokenTransfers(dto);

      expect(accountRepository.getTokenTransfers).toHaveBeenCalledWith(
        dto.address,
        undefined,
        undefined,
        undefined,
        1,
        10,
      );
    });
  });

  describe('getBalanceMulti', () => {
    it('should return balances for multiple addresses', async () => {
      const dto: GetBalanceMultiDto = {
        address: [
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          '0x1234567890123456789012345678901234567890',
        ],
      };

      cacheService.getOrSet
        .mockResolvedValueOnce({
          account: dto.address[0],
          balance: '1000000000000000000',
        })
        .mockResolvedValueOnce({
          account: dto.address[1],
          balance: '2000000000000000000',
        });

      const result = await service.getBalanceMulti(dto);

      expect(result.status).toBe('1');
      expect(result.result).toHaveLength(2);
      expect(result.result[0].balance).toBe('1000000000000000000');
      expect(result.result[1].balance).toBe('2000000000000000000');
    });

    it('should handle empty address array', async () => {
      const dto: GetBalanceMultiDto = {
        address: [],
      };

      const result = await service.getBalanceMulti(dto);

      expect(result.status).toBe('1');
      expect(result.result).toHaveLength(0);
    });

    it('should fetch from RPC if not cached', async () => {
      const dto: GetBalanceMultiDto = {
        address: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'],
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });
      rpcService.getBalance.mockResolvedValue(BigInt('1000000000000000000'));

      const result = await service.getBalanceMulti(dto);

      expect(result.result[0].balance).toBe('1000000000000000000');
      expect(rpcService.getBalance).toHaveBeenCalledWith(dto.address[0]);
    });
  });

  describe('getInternalTransactions', () => {
    it('should return internal transactions', async () => {
      const dto: GetInternalTransactionsDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [
          {
            fromAddress: '0x123',
            toAddress: dto.address,
            value: '1000000000000000000',
            traceAddress: '0',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      accountRepository.getInternalTransactions.mockResolvedValue(mockResult as any);

      const result = await service.getInternalTransactions(dto);

      expect(result.status).toBe('1');
      expect(result.result).toEqual(mockResult);
      expect(accountRepository.getInternalTransactions).toHaveBeenCalledWith(
        dto.address,
        undefined,
        undefined,
        1,
        10,
      );
    });

    it('should handle empty internal transactions', async () => {
      const dto: GetInternalTransactionsDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      accountRepository.getInternalTransactions.mockResolvedValue(mockResult as any);

      const result = await service.getInternalTransactions(dto);

      expect(result.result.data).toHaveLength(0);
    });
  });
});

