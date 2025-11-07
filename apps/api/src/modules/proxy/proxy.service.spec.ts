import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { RpcService } from '@/common/services/rpc.service';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('eth_blockNumber', () => {
    it('should return block number in hex format', async () => {
      const blockNumber = 12345;
      rpcService.getBlockNumber.mockResolvedValue(blockNumber);

      const result = await service.eth_blockNumber();

      expect(result.status).toBe('1');
      expect(result.result).toBe(`0x${blockNumber.toString(16)}`);
    });
  });

  describe('eth_getBalance', () => {
    it('should return balance in hex format', async () => {
      const address = '0x123';
      const balance = BigInt('1000000000000000000');
      rpcService.getBalance.mockResolvedValue(balance);

      const result = await service.eth_getBalance(address);

      expect(result.status).toBe('1');
      expect(result.result).toBe(`0x${balance.toString(16)}`);
    });
  });

  describe('eth_getBlockByNumber', () => {
    it('should return block information', async () => {
      const blockTag = 'latest';
      const mockBlock = {
        number: 12345,
        hash: '0xabc',
        parentHash: '0xdef',
        timestamp: 1234567890,
        gasLimit: BigInt('1000000'),
        gasUsed: BigInt('500000'),
        miner: '0x123',
        transactions: [],
      } as any;

      rpcService.getBlock.mockResolvedValue(mockBlock);

      const result = await service.eth_getBlockByNumber(blockTag);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
    });
  });

  describe('eth_getTransactionByHash', () => {
    it('should return transaction information', async () => {
      const txHash = '0x123';
      const mockTx = {
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
      } as any;

      rpcService.getTransaction.mockResolvedValue(mockTx);

      const result = await service.eth_getTransactionByHash(txHash);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
    });
  });

  describe('eth_call', () => {
    it('should execute contract call', async () => {
      const transaction = { to: '0x123', data: '0x' };
      const result = '0x0000000000000000000000000000000000000000000000000000000000000001';

      rpcService.call.mockResolvedValue(result);

      const response = await service.eth_call(transaction);

      expect(response.status).toBe('1');
      expect(response.result).toBe(result);
    });
  });

  describe('eth_estimateGas', () => {
    it('should estimate gas', async () => {
      const transaction = { to: '0x123', value: '1000000000000000000' };
      const gasEstimate = BigInt('21000');

      rpcService.estimateGas.mockResolvedValue(gasEstimate);

      const result = await service.eth_estimateGas(transaction);

      expect(result.status).toBe('1');
      expect(result.result).toBe(`0x${gasEstimate.toString(16)}`);
    });
  });
});

