import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';
import { StateRootService } from './services/state-root.service';
import { ValidatorService } from './services/validator.service';
import { ConsensusService } from './services/consensus.service';

describe('BlockchainService', () => {
  let service: BlockchainService;
  let stateRootService: jest.Mocked<StateRootService>;
  let validatorService: jest.Mocked<ValidatorService>;
  let consensusService: jest.Mocked<ConsensusService>;

  beforeEach(async () => {
    const mockStateRootService = {
      getStateRoot: jest.fn(),
    };
    const mockValidatorService = {
      getValidators: jest.fn(),
    };
    const mockConsensusService = {
      getInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: StateRootService,
          useValue: mockStateRootService,
        },
        {
          provide: ValidatorService,
          useValue: mockValidatorService,
        },
        {
          provide: ConsensusService,
          useValue: mockConsensusService,
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
    stateRootService = module.get(StateRootService);
    validatorService = module.get(ValidatorService);
    consensusService = module.get(ConsensusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStateRoot', () => {
    it('should call state root service', async () => {
      const blockNumber = '100';
      const mockResult = {
        stateRoot: '0xabc123...',
        blockNumber,
      };
      stateRootService.getStateRoot.mockResolvedValue(mockResult);

      const result = await service.getStateRoot(blockNumber);

      expect(result).toEqual(mockResult);
      expect(stateRootService.getStateRoot).toHaveBeenCalledWith(blockNumber);
    });
  });

  describe('getValidators', () => {
    it('should call validator service', async () => {
      const mockResult = {
        validators: ['0xV1', '0xV2'],
        count: 2,
      };
      validatorService.getValidators.mockResolvedValue(mockResult);

      const result = await service.getValidators();

      expect(result).toEqual(mockResult);
      expect(validatorService.getValidators).toHaveBeenCalled();
    });
  });

  describe('getConsensusInfo', () => {
    it('should call consensus service', async () => {
      const mockResult = {
        consensus: 'PoSA',
        blockTime: 3,
        finality: '1 block',
      };
      consensusService.getInfo.mockResolvedValue(mockResult);

      const result = await service.getConsensusInfo();

      expect(result).toEqual(mockResult);
      expect(consensusService.getInfo).toHaveBeenCalled();
    });
  });
});

