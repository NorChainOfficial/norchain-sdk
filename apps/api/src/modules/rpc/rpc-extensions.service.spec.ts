import { Test, TestingModule } from '@nestjs/testing';
import { RPCExtensionsService } from './rpc-extensions.service';
import { RpcService } from '@/common/services/rpc.service';
import { ethers } from 'ethers';

describe('RPCExtensionsService', () => {
  let service: RPCExtensionsService;
  let rpcService: RpcService;

  const mockProvider = {
    getTransaction: jest.fn(),
    getBlockNumber: jest.fn(),
    getBlock: jest.fn(),
    send: jest.fn(),
  };

  const mockRpcService = {
    getProvider: jest.fn(() => mockProvider),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RPCExtensionsService,
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<RPCExtensionsService>(RPCExtensionsService);
    rpcService = module.get<RpcService>(RpcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFinality', () => {
    it('should return final status for block with 2+ confirmations', async () => {
      const blockNumber = 100;
      mockProvider.getBlockNumber.mockResolvedValue(102);
      mockProvider.getBlock.mockResolvedValue({
        number: blockNumber,
        timestamp: Math.floor(Date.now() / 1000),
      });

      const result = await service.getFinality(blockNumber);

      expect(result.status).toBe('final');
      expect(result.confidence).toBe(100);
      expect(result.blockNumber).toBe(blockNumber);
    });

    it('should return safe status for block with 1 confirmation', async () => {
      const blockNumber = 100;
      mockProvider.getBlockNumber.mockResolvedValue(101);
      mockProvider.getBlock.mockResolvedValue({
        number: blockNumber,
        timestamp: Math.floor(Date.now() / 1000),
      });

      const result = await service.getFinality(blockNumber);

      expect(result.status).toBe('safe');
      expect(result.confidence).toBe(95);
    });

    it('should return unsafe status for block with 0 confirmations', async () => {
      const blockNumber = 100;
      mockProvider.getBlockNumber.mockResolvedValue(100);
      mockProvider.getBlock.mockResolvedValue({
        number: blockNumber,
        timestamp: Math.floor(Date.now() / 1000),
      });

      const result = await service.getFinality(blockNumber);

      expect(result.status).toBe('unsafe');
      expect(result.confidence).toBe(50);
    });

    it('should handle transaction hash', async () => {
      const txHash = '0x123';
      const blockNumber = 100;
      mockProvider.getTransaction.mockResolvedValue({
        blockNumber,
        hash: txHash,
      });
      mockProvider.getBlockNumber.mockResolvedValue(102);
      mockProvider.getBlock.mockResolvedValue({
        number: blockNumber,
        timestamp: Math.floor(Date.now() / 1000),
      });

      const result = await service.getFinality(txHash);

      expect(result.status).toBe('final');
      expect(mockProvider.getTransaction).toHaveBeenCalledWith(txHash);
    });

    it('should return unsafe if transaction not found', async () => {
      mockProvider.getTransaction.mockResolvedValue(null);

      const result = await service.getFinality('0xinvalid');

      expect(result.status).toBe('unsafe');
      expect(result.confidence).toBe(0);
    });
  });

  describe('getFeeHistoryPlus', () => {
    it('should return enhanced fee history', async () => {
      const blockCount = 10;
      const newestBlock = 'latest';
      const rewardPercentiles = [25, 50, 75];

      const mockFeeHistory = {
        gasUsedRatio: [0.5, 0.6, 0.7],
        baseFeePerGas: ['0x1', '0x2', '0x3'],
        reward: [['0x1', '0x2', '0x3'], ['0x2', '0x3', '0x4']],
      };

      mockProvider.send.mockResolvedValue(mockFeeHistory);

      const result = await service.getFeeHistoryPlus(blockCount, newestBlock, rewardPercentiles);

      expect(result).toHaveProperty('predictedBaseFee');
      expect(result).toHaveProperty('averageGasUsedRatio');
      expect(mockProvider.send).toHaveBeenCalledWith('eth_feeHistory', [
        `0x${blockCount.toString(16)}`,
        newestBlock,
        rewardPercentiles,
      ]);
    });
  });

  describe('getAccountProfile', () => {
    it('should return account profile', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const result = await service.getAccountProfile(address);

      expect(result).toHaveProperty('address', address.toLowerCase());
      expect(result).toHaveProperty('riskFlags');
      expect(result).toHaveProperty('kycTier');
      expect(result).toHaveProperty('velocityLimits');
      expect(result).toHaveProperty('complianceScore');
    });
  });

  describe('getStateProof', () => {
    it('should return state proof for keys', async () => {
      const keys = ['0x1', '0x2'];
      const blockNumber = 100;

      const result = await service.getStateProof(keys, blockNumber);

      expect(result).toHaveProperty('keys', keys);
      expect(result).toHaveProperty('values');
      expect(result).toHaveProperty('proof');
      expect(result).toHaveProperty('blockNumber', blockNumber);
      expect(result.values).toHaveLength(keys.length);
    });
  });

  describe('getValidatorSet', () => {
    it('should return validator set information', async () => {
      const result = await service.getValidatorSet('current');

      expect(result).toHaveProperty('validators');
      expect(result).toHaveProperty('totalStake');
      expect(result).toHaveProperty('activeCount');
      expect(Array.isArray(result.validators)).toBe(true);
    });

    it('should default to current tag', async () => {
      const result = await service.getValidatorSet();

      expect(result).toHaveProperty('validators');
    });
  });
});

