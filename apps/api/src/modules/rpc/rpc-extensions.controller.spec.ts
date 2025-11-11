import { Test, TestingModule } from '@nestjs/testing';
import { RPCExtensionsController } from './rpc-extensions.controller';
import { RPCExtensionsService } from './rpc-extensions.service';

describe('RPCExtensionsController', () => {
  let controller: RPCExtensionsController;
  let rpcExtensionsService: jest.Mocked<RPCExtensionsService>;

  const mockRPCExtensionsService = {
    getFinality: jest.fn(),
    getFeeHistoryPlus: jest.fn(),
    getAccountProfile: jest.fn(),
    getStateProof: jest.fn(),
    getValidatorSet: jest.fn(),
    norTokenProfile: jest.fn(),
    norContractProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RPCExtensionsController],
      providers: [
        {
          provide: RPCExtensionsService,
          useValue: mockRPCExtensionsService,
        },
      ],
    }).compile();

    controller = module.get<RPCExtensionsController>(RPCExtensionsController);
    rpcExtensionsService = module.get(RPCExtensionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFinality', () => {
    it('should return finality status for block number', async () => {
      const body = { blockOrTx: 12345 };
      const mockResult = {
        finalized: true,
        blockNumber: 12345,
        finalityTime: 2000,
      };

      mockRPCExtensionsService.getFinality.mockResolvedValue(mockResult);

      const result = await controller.getFinality(body);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getFinality).toHaveBeenCalledWith(body.blockOrTx);
    });

    it('should return finality status for transaction hash', async () => {
      const body = { blockOrTx: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' };
      const mockResult = {
        finalized: true,
        txHash: body.blockOrTx,
        finalityTime: 1500,
      };

      mockRPCExtensionsService.getFinality.mockResolvedValue(mockResult);

      const result = await controller.getFinality(body);

      expect(result).toEqual(mockResult);
    });
  });

  describe('getFeeHistoryPlus', () => {
    it('should return enhanced fee history', async () => {
      const body = {
        blockCount: 10,
        newestBlock: 'latest',
        rewardPercentiles: [25, 50, 75],
      };
      const mockResult = {
        oldestBlock: '0x123',
        baseFeePerGas: ['0x1', '0x2'],
        gasUsedRatio: [0.5, 0.6],
        reward: [['0x100', '0x200', '0x300']],
        predictedNextBaseFee: '0x3',
      };

      mockRPCExtensionsService.getFeeHistoryPlus.mockResolvedValue(mockResult);

      const result = await controller.getFeeHistoryPlus(body);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getFeeHistoryPlus).toHaveBeenCalledWith(
        body.blockCount,
        body.newestBlock,
        body.rewardPercentiles,
      );
    });
  });

  describe('getAccountProfile', () => {
    it('should return account profile', async () => {
      const body = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' };
      const mockResult = {
        address: body.address,
        riskFlags: [],
        kycTier: 'tier1',
        velocityLimits: {
          daily: '1000000000000000000000',
          monthly: '10000000000000000000000',
        },
      };

      mockRPCExtensionsService.getAccountProfile.mockResolvedValue(mockResult);

      const result = await controller.getAccountProfile(body);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getAccountProfile).toHaveBeenCalledWith(body.address);
    });
  });

  describe('getStateProof', () => {
    it('should return state proof', async () => {
      const body = {
        keys: ['0x123', '0x456'],
        blockNumber: 12345,
      };
      const mockResult = {
        blockNumber: body.blockNumber,
        proofs: [
          { key: '0x123', proof: '0xabc' },
          { key: '0x456', proof: '0xdef' },
        ],
        merkleRoot: '0xroot',
      };

      mockRPCExtensionsService.getStateProof.mockResolvedValue(mockResult);

      const result = await controller.getStateProof(body);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getStateProof).toHaveBeenCalledWith(
        body.keys,
        body.blockNumber,
      );
    });
  });

  describe('getValidatorSet', () => {
    it('should return current validator set', async () => {
      const body: { tag?: 'current' | 'next' } = { tag: 'current' };
      const mockResult = {
        validators: [
          {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            stake: '10000000000000000000000',
          },
        ],
        totalStake: '10000000000000000000000',
      };

      mockRPCExtensionsService.getValidatorSet.mockResolvedValue(mockResult);

      const result = await controller.getValidatorSet(body);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.getValidatorSet).toHaveBeenCalledWith(body.tag);
    });

    it('should return next validator set', async () => {
      const body: { tag?: 'current' | 'next' } = { tag: 'next' };
      const mockResult = {
        validators: [],
        totalStake: '0',
      };

      mockRPCExtensionsService.getValidatorSet.mockResolvedValue(mockResult);

      const result = await controller.getValidatorSet(body);

      expect(result).toEqual(mockResult);
    });

    it('should use default tag when not provided', async () => {
      const body: { tag?: 'current' | 'next' } = {};
      const mockResult = {
        validators: [],
        totalStake: '0',
      };

      mockRPCExtensionsService.getValidatorSet.mockResolvedValue(mockResult);

      await controller.getValidatorSet(body);

      expect(rpcExtensionsService.getValidatorSet).toHaveBeenCalledWith(undefined);
    });
  });

  describe('norTokenProfile', () => {
    it('should return token profile', async () => {
      const body = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' };
      const mockResult = {
        address: body.address,
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        trustLevel: 'verified',
      };

      mockRPCExtensionsService.norTokenProfile.mockResolvedValue(mockResult);

      const result = await controller.norTokenProfile(body);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.norTokenProfile).toHaveBeenCalledWith(body.address);
    });
  });

  describe('norContractProfile', () => {
    it('should return contract profile', async () => {
      const body = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' };
      const mockResult = {
        address: body.address,
        name: 'Test Contract',
        type: 'ERC20',
        verified: true,
      };

      mockRPCExtensionsService.norContractProfile.mockResolvedValue(mockResult);

      const result = await controller.norContractProfile(body);

      expect(result).toEqual(mockResult);
      expect(rpcExtensionsService.norContractProfile).toHaveBeenCalledWith(body.address);
    });
  });
});

