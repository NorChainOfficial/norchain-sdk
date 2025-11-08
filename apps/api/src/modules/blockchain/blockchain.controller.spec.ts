import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

describe('BlockchainController', () => {
  let controller: BlockchainController;
  let service: jest.Mocked<BlockchainService>;

  beforeEach(async () => {
    const mockBlockchainService = {
      getStateRoot: jest.fn(),
      getValidators: jest.fn(),
      getConsensusInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
      ],
    }).compile();

    controller = module.get<BlockchainController>(BlockchainController);
    service = module.get(BlockchainService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStateRoot', () => {
    it('should return state root for block', async () => {
      const blockNumber = '100';
      const mockResult = {
        stateRoot: '0xabc123...',
        blockNumber,
      };
      service.getStateRoot.mockResolvedValue(mockResult);

      const result = await controller.getStateRoot(blockNumber);

      expect(result).toEqual(mockResult);
      expect(service.getStateRoot).toHaveBeenCalledWith(blockNumber);
    });
  });

  describe('getValidators', () => {
    it('should return validator set information', async () => {
      const mockResult = {
        validators: ['0xV1', '0xV2', '0xV3'],
        count: 3,
      };
      service.getValidators.mockResolvedValue(mockResult);

      const result = await controller.getValidators();

      expect(result).toEqual(mockResult);
      expect(service.getValidators).toHaveBeenCalled();
    });
  });

  describe('getConsensusInfo', () => {
    it('should return consensus information', async () => {
      const mockResult = {
        consensus: 'PoSA',
        blockTime: 3,
        finality: '1 block',
      };
      service.getConsensusInfo.mockResolvedValue(mockResult);

      const result = await controller.getConsensusInfo();

      expect(result).toEqual(mockResult);
      expect(service.getConsensusInfo).toHaveBeenCalled();
    });
  });
});

