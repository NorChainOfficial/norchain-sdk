import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorsController } from './validators.controller';
import { RPCExtensionsService } from '../../rpc/rpc-extensions.service';

describe('ValidatorsController', () => {
  let controller: ValidatorsController;
  let rpcExtensionsService: jest.Mocked<RPCExtensionsService>;

  const mockRPCExtensionsService = {
    getValidatorSet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidatorsController],
      providers: [
        {
          provide: RPCExtensionsService,
          useValue: mockRPCExtensionsService,
        },
      ],
    }).compile();

    controller = module.get<ValidatorsController>(ValidatorsController);
    rpcExtensionsService = module.get(RPCExtensionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getValidators', () => {
    it('should return current validator set', async () => {
      const tag = 'current';
      const mockResult = {
        validators: [
          {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            stake: '10000000000000000000000',
            uptime: 99.5,
            complianceScore: 95,
            status: 'active',
          },
        ],
        totalStake: '10000000000000000000000',
        activeCount: 1,
      };

      mockRPCExtensionsService.getValidatorSet.mockResolvedValue(mockResult);

      const result = await controller.getValidators(tag);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getValidatorSet).toHaveBeenCalledWith(tag);
    });

    it('should return next validator set', async () => {
      const tag = 'next';
      const mockResult = {
        validators: [],
        totalStake: '0',
        activeCount: 0,
      };

      mockRPCExtensionsService.getValidatorSet.mockResolvedValue(mockResult);

      const result = await controller.getValidators(tag);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getValidatorSet).toHaveBeenCalledWith(tag);
    });

    it('should handle undefined tag', async () => {
      const mockResult = {
        validators: [],
        totalStake: '0',
        activeCount: 0,
      };

      mockRPCExtensionsService.getValidatorSet.mockResolvedValue(mockResult);

      await controller.getValidators(undefined);

      expect(rpcExtensionsService.getValidatorSet).toHaveBeenCalledWith(undefined);
    });
  });
});

