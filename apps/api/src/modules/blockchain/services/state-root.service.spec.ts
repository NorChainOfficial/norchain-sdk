import { Test, TestingModule } from '@nestjs/testing';
import { StateRootService } from './state-root.service';
import { ProxyService } from '../../proxy/proxy.service';

describe('StateRootService', () => {
  let service: StateRootService;
  let proxyService: jest.Mocked<ProxyService>;

  beforeEach(async () => {
    const mockProxyService = {
      eth_getBlockByNumber: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateRootService,
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
      ],
    }).compile();

    service = module.get<StateRootService>(StateRootService);
    proxyService = module.get(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStateRoot', () => {
    it('should return state root for block', async () => {
      const blockNumber = '100';
      proxyService.eth_getBlockByNumber.mockResolvedValue({
        status: '1',
        result: {
          number: '0x64',
          hash: '0xabc123',
          parentHash: '0xdef456',
          timestamp: '0x5f5e100',
          gasLimit: '0x1c9c380',
          gasUsed: '0x5208',
          miner: '0x0000000000000000000000000000000000000000',
          difficulty: '0x0',
          extraData: '0x',
          transactions: [],
          transactionsRoot: '0x123',
          stateRoot: '0xabc123...',
          receiptsRoot: '0x456',
        },
        message: 'OK',
      } as any);

      const result = await service.getStateRoot(blockNumber);

      expect(result.stateRoot).toBe('0xabc123...');
      expect(result.blockNumber).toBe(blockNumber);
      expect(proxyService.eth_getBlockByNumber).toHaveBeenCalledWith(blockNumber, false);
    });

    it('should return default state root when block not found', async () => {
      const blockNumber = '100';
      proxyService.eth_getBlockByNumber.mockResolvedValue({
        status: '0',
        result: null,
        message: 'Not found',
      } as any);

      const result = await service.getStateRoot(blockNumber);

      expect(result.stateRoot).toBe('0x0');
      expect(result.blockNumber).toBe(blockNumber);
    });

    it('should handle errors', async () => {
      const blockNumber = '100';
      proxyService.eth_getBlockByNumber.mockRejectedValue(new Error('RPC error'));

      await expect(service.getStateRoot(blockNumber)).rejects.toThrow();
    });
  });
});

