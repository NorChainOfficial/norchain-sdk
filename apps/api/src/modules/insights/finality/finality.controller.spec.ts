import { Test, TestingModule } from '@nestjs/testing';
import { FinalityController } from './finality.controller';
import { RPCExtensionsService } from '../../rpc/rpc-extensions.service';

describe('FinalityController', () => {
  let controller: FinalityController;
  let rpcExtensionsService: jest.Mocked<RPCExtensionsService>;

  const mockRPCExtensionsService = {
    getFinality: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinalityController],
      providers: [
        {
          provide: RPCExtensionsService,
          useValue: mockRPCExtensionsService,
        },
      ],
    }).compile();

    controller = module.get<FinalityController>(FinalityController);
    rpcExtensionsService = module.get(RPCExtensionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTxFinality', () => {
    it('should return finality status for transaction hash', async () => {
      const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const mockResult = {
        status: 'final',
        blockNumber: 12345,
        confidence: 100,
        timestamp: new Date(),
      };

      mockRPCExtensionsService.getFinality.mockResolvedValue(mockResult);

      const result = await controller.getTxFinality(hash);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getFinality).toHaveBeenCalledWith(hash);
    });
  });

  describe('getBlockFinality', () => {
    it('should return finality status for block number', async () => {
      const blockNumber = '12345';
      const mockResult = {
        status: 'final',
        blockNumber: 12345,
        confidence: 100,
        timestamp: new Date(),
      };

      mockRPCExtensionsService.getFinality.mockResolvedValue(mockResult);

      const result = await controller.getBlockFinality(blockNumber);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getFinality).toHaveBeenCalledWith(12345);
    });

    it('should parse block number correctly', async () => {
      const blockNumber = '99999';
      const mockResult = {
        status: 'safe',
        blockNumber: 99999,
        confidence: 95,
        timestamp: new Date(),
      };

      mockRPCExtensionsService.getFinality.mockResolvedValue(mockResult);

      await controller.getBlockFinality(blockNumber);

      expect(rpcExtensionsService.getFinality).toHaveBeenCalledWith(99999);
    });
  });
});

