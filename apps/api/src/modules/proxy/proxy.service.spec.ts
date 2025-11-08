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
  });
});
