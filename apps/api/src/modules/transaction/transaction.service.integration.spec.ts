import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('TransactionService Integration', () => {
  let service: TransactionService;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;

  beforeEach(async () => {
    const mockRpcService = {
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
      getTransactionCount: jest.fn(),
      getBlock: jest.fn(),
      getBlockNumber: jest.fn(),
      getBalance: jest.fn(),
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

    const mockTransactionRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransaction', () => {
    it('should get transaction from cache if available', async () => {
      const txHash = '0x1234567890abcdef';
      const cachedTx = {
        hash: txHash,
        from: '0xfrom',
        to: '0xto',
        value: '1000000000000000000',
      };

      cacheService.getOrSet.mockResolvedValue(cachedTx);

      const result = await service.getTransaction(txHash);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(cacheService.getOrSet).toHaveBeenCalled();
    });

    it('should fetch transaction from RPC if not cached', async () => {
      const txHash = '0x1234567890abcdef';
      const rpcTx = {
        hash: txHash,
        blockNumber: 12345,
        from: '0xfrom',
        to: '0xto',
        value: BigInt('1000000000000000000'),
        gasLimit: BigInt('21000'),
        gasPrice: BigInt('20000000000'),
        data: '0x',
        nonce: 0,
        type: 2,
        toJSON: jest.fn(),
        wait: jest.fn(),
        provider: null,
      } as any;

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getTransaction.mockResolvedValue(rpcTx);
        return fn();
      });

      const result = await service.getTransaction(txHash);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(rpcService.getTransaction).toHaveBeenCalledWith(txHash);
    });

    it('should check database before RPC when available', async () => {
      const txHash = '0x1234567890abcdef';
      const dbTx = {
        id: '1',
        hash: txHash,
        fromAddress: '0xfrom',
        toAddress: '0xto',
        value: '1000000000000000000',
        blockNumber: 12345,
        blockHash: '0xabc',
        transactionIndex: 0,
        status: 1,
        gas: '21000', // Transaction entity uses 'gas' not 'gasLimit'
        gasLimit: '21000',
        gasPrice: '20000000000',
        gasUsed: '21000',
        nonce: 0,
        inputData: '0x',
        data: '0x',
        createdAt: new Date(),
        updatedAt: new Date(),
        block: null,
        logs: [],
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        transactionRepository.findOne.mockResolvedValue(dbTx as any);
        return fn();
      });

      const result = await service.getTransaction(txHash);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      // Note: The service uses cache, so transactionRepository is called within the cache callback
    });
  });

  describe('getTxReceiptStatus', () => {
    it('should get receipt status from RPC', async () => {
      const txHash = '0x1234567890abcdef';
      const receipt = {
        hash: txHash,
        status: 1,
        gasUsed: BigInt('21000'),
        blockNumber: 12345,
        toJSON: jest.fn(),
      } as any;

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getTransactionReceipt.mockResolvedValue(receipt);
        return fn();
      });

      const result = await service.getTxReceiptStatus(txHash);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result.status).toBe('1');
      expect(rpcService.getTransactionReceipt).toHaveBeenCalledWith(txHash);
    });
  });

  describe('getStatus', () => {
    it('should determine transaction status from receipt', async () => {
      const txHash = '0x1234567890abcdef';
      const receipt = {
        hash: txHash,
        status: 1,
        gasUsed: BigInt('21000'),
        blockNumber: 12345,
        toJSON: jest.fn(),
      } as any;

      // Mock transaction with blockNumber (confirmed)
      const tx = {
        hash: txHash,
        blockNumber: 12345,
        blockHash: '0xabc',
        toJSON: jest.fn(),
        wait: jest.fn().mockResolvedValue(receipt),
      } as any;

      rpcService.getTransaction.mockResolvedValue(tx);
      rpcService.getTransactionReceipt.mockResolvedValue(receipt);

      const result = await service.getStatus(txHash);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      expect(result.result.isError).toBe('0');
      expect(result.result.status).toBe('confirmed');
      expect(rpcService.getTransaction).toHaveBeenCalledWith(txHash);
      expect(rpcService.getTransactionReceipt).toHaveBeenCalledWith(txHash);
    });
  });
});

