import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { RpcService } from '@/common/services/rpc.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('ProxyService', () => {
  let service: ProxyService;
  let rpcService: jest.Mocked<RpcService>;

  beforeEach(async () => {
    const mockRpcService = {
      getBlockNumber: jest.fn(),
      getBalance: jest.fn(),
      getBlock: jest.fn(),
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
      call: jest.fn(),
      estimateGas: jest.fn(),
      getCode: jest.fn(),
      getLogs: jest.fn(),
      getFeeData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
    rpcService = module.get(RpcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('eth_blockNumber', () => {
    it('should return block number in hex format', async () => {
      const blockNumber = 12345;
      rpcService.getBlockNumber.mockResolvedValue(blockNumber);

      const result = await service.eth_blockNumber();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe('0x' + blockNumber.toString(16));
      expect(rpcService.getBlockNumber).toHaveBeenCalled();
    });
  });

  describe('eth_getBalance', () => {
    it('should return balance in hex format', async () => {
      const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const balance = BigInt('1000000000000000000');
      rpcService.getBalance.mockResolvedValue(balance);

      const result = await service.eth_getBalance(address, 'latest');

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe('0x' + balance.toString(16));
      expect(rpcService.getBalance).toHaveBeenCalled();
    });
  });

  describe('eth_getBlockByNumber', () => {
    it('should return block information for latest', async () => {
      const block = {
        number: 12345,
        hash: '0xabc',
        parentHash: '0xdef',
        timestamp: 1234567890,
        transactions: [],
        gasUsed: BigInt('500000'),
        gasLimit: BigInt('1000000'),
        miner: '0xminer',
        difficulty: BigInt('1000'),
        extraData: '0x',
        toJSON: jest.fn(),
      } as any;

      rpcService.getBlock.mockResolvedValue(block);

      const result = await service.eth_getBlockByNumber('latest', false);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(rpcService.getBlock).toHaveBeenCalledWith('latest');
    });

    it('should return block information for block number', async () => {
      const block = {
        number: 12345,
        hash: '0xabc',
        parentHash: '0xdef',
        timestamp: 1234567890,
        transactions: [],
        gasUsed: BigInt('500000'),
        gasLimit: BigInt('1000000'),
        miner: '0xminer',
        difficulty: BigInt('1000'),
        extraData: '0x',
        toJSON: jest.fn(),
      } as any;

      rpcService.getBlock.mockResolvedValue(block);

      const result = await service.eth_getBlockByNumber('0x3039', false);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(rpcService.getBlock).toHaveBeenCalled();
    });
  });

  describe('eth_getTransactionByHash', () => {
    it('should return transaction by hash', async () => {
      const txHash = '0x1234567890abcdef';
      const tx = {
        hash: txHash,
        blockNumber: 12345,
        blockHash: '0xabc',
        index: 0,
        from: '0xfrom',
        to: '0xto',
        value: BigInt('1000000000000000000'),
        gasLimit: BigInt('21000'),
        gasPrice: BigInt('20000000000'),
        data: '0x',
        nonce: 0,
        toJSON: jest.fn(),
      } as any;

      rpcService.getTransaction.mockResolvedValue(tx);

      const result = await service.eth_getTransactionByHash(txHash);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(rpcService.getTransaction).toHaveBeenCalledWith(txHash);
    });
  });

  describe('eth_getTransactionReceipt', () => {
    it('should return transaction receipt', async () => {
      const txHash = '0x1234567890abcdef';
      const receipt = {
        hash: txHash,
        blockNumber: 12345,
        blockHash: '0xabc',
        index: 0,
        from: '0xfrom',
        to: '0xto',
        status: 1,
        gasUsed: BigInt('21000'),
        cumulativeGasUsed: BigInt('21000'),
        logs: [],
        logsBloom: '0x',
        toJSON: jest.fn(),
      } as any;

      rpcService.getTransactionReceipt.mockResolvedValue(receipt);

      const result = await service.eth_getTransactionReceipt(txHash);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(rpcService.getTransactionReceipt).toHaveBeenCalledWith(txHash);
    });
  });

  describe('eth_call', () => {
    it('should execute call', async () => {
      const transaction = {
        to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        data: '0x',
      };
      const result = '0x1234';

      rpcService.call.mockResolvedValue(result);

      const response = await service.eth_call(transaction, 'latest');

      expect(response).toBeDefined();
      expect(response.status).toBe('1');
      expect(response.result).toBe(result);
      expect(rpcService.call).toHaveBeenCalled();
    });
  });

  describe('eth_estimateGas', () => {
    it('should estimate gas for transaction', async () => {
      const transaction = {
        to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        value: '1000000000000000000',
      };
      const gasEstimate = BigInt('21000');

      rpcService.estimateGas.mockResolvedValue(gasEstimate);

      const result = await service.eth_estimateGas(transaction);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe('0x' + gasEstimate.toString(16));
      expect(rpcService.estimateGas).toHaveBeenCalled();
    });
  });

  describe('eth_getCode', () => {
    it('should return contract code', async () => {
      const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const code = '0x6080604052348015600f57600080fd5b50';

      rpcService.getCode.mockResolvedValue(code);

      const result = await service.eth_getCode(address, 'latest');

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe(code);
      expect(rpcService.getCode).toHaveBeenCalledWith(address);
    });
  });

  describe('eth_getLogs', () => {
    it('should return event logs', async () => {
      const filter = {
        fromBlock: 1000,
        toBlock: 2000,
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      };
      const logs = [] as any;

      rpcService.getLogs.mockResolvedValue(logs);

      const result = await service.eth_getLogs(filter);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(rpcService.getLogs).toHaveBeenCalledWith(filter);
    });
  });

  describe('eth_gasPrice', () => {
    it('should return current gas price', async () => {
      const feeData = {
        gasPrice: BigInt('20000000000'),
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        toJSON: jest.fn(),
      } as any;

      rpcService.getFeeData.mockResolvedValue(feeData);

      const result = await service.eth_gasPrice();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe('0x' + feeData.gasPrice.toString(16));
      expect(rpcService.getFeeData).toHaveBeenCalled();
    });

    it('should handle null gasPrice', async () => {
      const feeData = {
        gasPrice: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
        toJSON: jest.fn(),
      } as any;

      rpcService.getFeeData.mockResolvedValue(feeData);

      const result = await service.eth_gasPrice();

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toBe('0x0');
    });
  });

  describe('eth_getBlockByNumber', () => {
    it('should return error when block not found', async () => {
      rpcService.getBlock.mockResolvedValue(null);

      const result = await service.eth_getBlockByNumber('0x3039', false);

      expect(result).toBeDefined();
      expect(result.status).toBe('0');
      expect(result.message).toBe('Block not found');
    });

    it('should handle pending block tag', async () => {
      const block = {
        number: 12345,
        hash: '0xabc',
        parentHash: '0xdef',
        timestamp: 1234567890,
        transactions: [],
        gasUsed: BigInt('500000'),
        gasLimit: BigInt('1000000'),
        miner: '0xminer',
        difficulty: BigInt('1000'),
        extraData: '0x',
        toJSON: jest.fn(),
      } as any;

      rpcService.getBlock.mockResolvedValue(block);

      const result = await service.eth_getBlockByNumber('pending', false);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(rpcService.getBlock).toHaveBeenCalledWith('pending');
    });

    it('should format block with full transactions', async () => {
      const block = {
        number: 12345,
        hash: '0xabc',
        parentHash: '0xdef',
        timestamp: 1234567890,
        transactions: [
          {
            hash: '0xtx1',
            blockNumber: 12345,
            from: '0xfrom',
            to: '0xto',
            value: BigInt('1000'),
            gasLimit: BigInt('21000'),
            gasPrice: BigInt('20000000000'),
            data: '0x',
            nonce: 0,
            index: 0,
          },
        ],
        gasUsed: BigInt('500000'),
        gasLimit: BigInt('1000000'),
        miner: '0xminer',
        difficulty: BigInt('1000'),
        extraData: '0x',
        toJSON: jest.fn(),
      } as any;

      rpcService.getBlock.mockResolvedValue(block);

      const result = await service.eth_getBlockByNumber('0x3039', true);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result.transactions).toHaveLength(1);
      expect(result.result.transactions[0]).toHaveProperty('hash');
    });

    it('should format block with transaction hashes only', async () => {
      const block = {
        number: 12345,
        hash: '0xabc',
        parentHash: '0xdef',
        timestamp: 1234567890,
        transactions: ['0xtx1', '0xtx2'],
        gasUsed: BigInt('500000'),
        gasLimit: BigInt('1000000'),
        miner: '0xminer',
        difficulty: BigInt('1000'),
        extraData: '0x',
        toJSON: jest.fn(),
      } as any;

      rpcService.getBlock.mockResolvedValue(block);

      const result = await service.eth_getBlockByNumber('0x3039', false);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result.transactions).toEqual(['0xtx1', '0xtx2']);
    });
  });

  describe('eth_getTransactionByHash', () => {
    it('should return error when transaction not found', async () => {
      rpcService.getTransaction.mockResolvedValue(null);

      const result = await service.eth_getTransactionByHash('0xinvalid');

      expect(result).toBeDefined();
      expect(result.status).toBe('0');
      expect(result.message).toBe('Transaction not found');
    });

    it('should format transaction with null to address', async () => {
      const tx = {
        hash: '0x123',
        blockNumber: 12345,
        blockHash: '0xabc',
        index: 0,
        from: '0xfrom',
        to: null,
        value: BigInt('1000000000000000000'),
        gasLimit: BigInt('21000'),
        gasPrice: BigInt('20000000000'),
        data: '0x',
        nonce: 0,
        toJSON: jest.fn(),
      } as any;

      rpcService.getTransaction.mockResolvedValue(tx);

      const result = await service.eth_getTransactionByHash('0x123');

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result.to).toBe(null);
    });
  });

  describe('eth_getTransactionReceipt', () => {
    it('should return error when receipt not found', async () => {
      rpcService.getTransactionReceipt.mockResolvedValue(null);

      const result = await service.eth_getTransactionReceipt('0xinvalid');

      expect(result).toBeDefined();
      expect(result.status).toBe('0');
      expect(result.message).toBe('Transaction receipt not found');
    });

    it('should format receipt with logs', async () => {
      const receipt = {
        hash: '0x123',
        blockNumber: 12345,
        blockHash: '0xabc',
        index: 0,
        from: '0xfrom',
        to: '0xto',
        status: 1,
        gasUsed: BigInt('21000'),
        cumulativeGasUsed: BigInt('21000'),
        logs: [
          {
            address: '0xlog',
            topics: ['0xtopic'],
            data: '0xdata',
            blockNumber: 12345,
            transactionHash: '0x123',
            transactionIndex: 0,
            blockHash: '0xabc',
            index: 0,
            removed: false,
          },
        ],
        logsBloom: '0x',
        contractAddress: '0xcontract',
        toJSON: jest.fn(),
      } as any;

      rpcService.getTransactionReceipt.mockResolvedValue(receipt);

      const result = await service.eth_getTransactionReceipt('0x123');

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result.logs).toHaveLength(1);
      expect(result.result.logs[0]).toHaveProperty('address');
    });
  });

  describe('eth_call', () => {
    it('should handle call errors', async () => {
      rpcService.call.mockRejectedValue(new Error('Call failed'));

      const result = await service.eth_call({ to: '0x123', data: '0x' });

      expect(result).toBeDefined();
      expect(result.status).toBe('0');
      expect(result.message).toBe('Call failed');
    });
  });

  describe('eth_estimateGas', () => {
    it('should handle gas estimation errors', async () => {
      rpcService.estimateGas.mockRejectedValue(new Error('Gas estimation failed'));

      const result = await service.eth_estimateGas({ to: '0x123', value: '1000' });

      expect(result).toBeDefined();
      expect(result.status).toBe('0');
      expect(result.message).toBe('Gas estimation failed');
    });
  });

  describe('eth_getLogs', () => {
    it('should handle getLogs errors', async () => {
      rpcService.getLogs.mockRejectedValue(new Error('Failed to get logs'));

      const result = await service.eth_getLogs({
        fromBlock: 1000,
        toBlock: 2000,
      } as any);

      expect(result).toBeDefined();
      expect(result.status).toBe('0');
      expect(result.message).toBe('Failed to get logs');
    });

    it('should format logs correctly', async () => {
      const logs = [
        {
          address: '0xlog',
          topics: ['0xtopic'],
          data: '0xdata',
          blockNumber: 12345,
          transactionHash: '0x123',
          transactionIndex: 0,
          blockHash: '0xabc',
          index: 0,
          removed: false,
        },
      ] as any;

      rpcService.getLogs.mockResolvedValue(logs);

      const result = await service.eth_getLogs({
        fromBlock: 1000,
        toBlock: 2000,
      } as any);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toHaveLength(1);
      expect(result.result[0]).toHaveProperty('address');
    });
  });
});
