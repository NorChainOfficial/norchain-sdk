import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BridgeService } from './bridge.service';
import { BridgeTransfer, BridgeTransferStatus, BridgeChain } from './entities/bridge-transfer.entity';
import { RpcService } from '@/common/services/rpc.service';
import { PolicyService } from '../policy/policy.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateBridgeQuoteDto } from './dto/create-bridge-quote.dto';
import { CreateBridgeTransferDto } from './dto/create-bridge-transfer.dto';

describe('BridgeService', () => {
  let service: BridgeService;
  let bridgeTransferRepository: Repository<BridgeTransfer>;
  let rpcService: RpcService;
  let policyService: PolicyService;

  const mockBridgeTransferRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockRpcService = {
    getProvider: jest.fn(),
    getBalance: jest.fn(),
  };

  const mockPolicyService = {
    checkPolicy: jest.fn().mockResolvedValue({ allowed: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BridgeService,
        {
          provide: getRepositoryToken(BridgeTransfer),
          useValue: mockBridgeTransferRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: PolicyService,
          useValue: mockPolicyService,
        },
      ],
    }).compile();

    service = module.get<BridgeService>(BridgeService);
    bridgeTransferRepository = module.get<Repository<BridgeTransfer>>(
      getRepositoryToken(BridgeTransfer),
    );
    rpcService = module.get<RpcService>(RpcService);
    policyService = module.get<PolicyService>(PolicyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuote', () => {
    it('should return a bridge quote', async () => {
      const dto: CreateBridgeQuoteDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000', // 1 NOR
        asset: 'NOR',
      };

      const result = await service.getQuote(dto);

      expect(result).toHaveProperty('srcChain', BridgeChain.NOR);
      expect(result).toHaveProperty('dstChain', BridgeChain.BSC);
      expect(result).toHaveProperty('amount', dto.amount);
      expect(result).toHaveProperty('fees');
      expect(result).toHaveProperty('amountAfterFees');
      expect(result).toHaveProperty('estimatedTimeMinutes');
    });

    it('should throw BadRequestException if src and dst chains are the same', async () => {
      const dto: CreateBridgeQuoteDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.NOR,
        amount: '1000000000000000000',
        asset: 'NOR',
      };

      await expect(service.getQuote(dto)).rejects.toThrow(BadRequestException);
    });

    it('should calculate fees correctly', async () => {
      const dto: CreateBridgeQuoteDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000', // 1 NOR
        asset: 'NOR',
      };

      const result = await service.getQuote(dto);

      // Fee should be 0.05% (5 basis points)
      const expectedFee = BigInt('500000000000000'); // 0.005 NOR
      expect(BigInt(result.fees)).toBe(expectedFee);
    });
  });

  describe('createTransfer', () => {
    it('should create a bridge transfer', async () => {
      const dto: CreateBridgeTransferDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000',
        asset: 'NOR',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockTransfer = {
        id: 'transfer-123',
        userId: 'user-123',
        ...dto,
        status: BridgeTransferStatus.PENDING_POLICY,
        createdAt: new Date(),
      };

      mockBridgeTransferRepository.create.mockReturnValue(mockTransfer);
      mockBridgeTransferRepository.save.mockResolvedValue(mockTransfer);

      const result = await service.createTransfer('user-123', dto);

      expect(result).toHaveProperty('transfer_id');
      expect(result).toHaveProperty('status', BridgeTransferStatus.PENDING_POLICY);
      expect(mockBridgeTransferRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if chains are the same', async () => {
      const dto: CreateBridgeTransferDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.NOR,
        amount: '1000000000000000000',
        asset: 'NOR',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      await expect(service.createTransfer('user-123', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should check policy before creating transfer', async () => {
      const dto: CreateBridgeTransferDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000',
        asset: 'NOR',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      mockPolicyService.checkPolicy.mockRejectedValue(
        new ForbiddenException('Transaction blocked by policy'),
      );

      await expect(service.createTransfer('user-123', dto)).rejects.toThrow();

      expect(mockPolicyService.checkPolicy).toHaveBeenCalled();
    });
  });

  describe('getTransfer', () => {
    it('should return transfer details', async () => {
      const transferId = 'transfer-123';
      const mockTransfer = {
        id: transferId,
        userId: 'user-123',
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000',
        status: BridgeTransferStatus.PENDING,
      };

      mockBridgeTransferRepository.findOne.mockResolvedValue(mockTransfer);

      const result = await service.getTransfer('user-123', transferId);

      expect(result).toHaveProperty('transfer_id', transferId);
      expect(result).toHaveProperty('status', BridgeTransferStatus.PENDING);
    });

    it('should throw NotFoundException if transfer not found', async () => {
      mockBridgeTransferRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getTransfer('user-123', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserTransfers', () => {
    it('should return paginated transfers', async () => {
      const mockTransfers = [
        {
          id: 'transfer-1',
          userId: 'user-123',
          status: BridgeTransferStatus.PENDING,
          srcChain: BridgeChain.NOR,
          dstChain: BridgeChain.BSC,
          asset: 'NOR',
          amount: '1000000000000000000',
          createdAt: new Date(),
          completedAt: null,
        },
      ];

      mockBridgeTransferRepository.findAndCount.mockResolvedValue([
        mockTransfers,
        1,
      ]);

      const result = await service.getUserTransfers('user-123', 50, 0);

      expect(result).toHaveProperty('transfers');
      expect(result).toHaveProperty('total', 1);
      expect(result.transfers).toHaveLength(1);
    });

    it('should return empty array when no transfers', async () => {
      mockBridgeTransferRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getUserTransfers('user-123', 50, 0);

      expect(result.transfers).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      mockBridgeTransferRepository.findAndCount.mockResolvedValue([[], 100]);

      const result = await service.getUserTransfers('user-123', 10, 5);

      expect(result.total).toBe(100);
      expect(mockBridgeTransferRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 5,
        }),
      );
    });
  });

  describe('createTransfer', () => {
    it('should handle idempotency key', async () => {
      const dto: CreateBridgeTransferDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000',
        asset: 'NOR',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        idempotencyKey: 'idempotent-key-123',
      };

      const existingTransfer = {
        id: 'transfer-123',
        userId: 'user-123',
        idempotencyKey: 'idempotent-key-123',
        status: BridgeTransferStatus.PENDING,
      };

      mockBridgeTransferRepository.findOne.mockResolvedValue(existingTransfer);

      const result = await service.createTransfer('user-123', dto);

      expect(result).toHaveProperty('transfer_id', 'transfer-123');
      expect(result).toHaveProperty('message', 'Transfer already exists (idempotent)');
      expect(mockBridgeTransferRepository.save).not.toHaveBeenCalled();
    });

    it('should handle different chain pairs', async () => {
      const dto: CreateBridgeTransferDto = {
        srcChain: BridgeChain.ETHEREUM,
        dstChain: BridgeChain.TRON,
        amount: '1000000000000000000',
        asset: 'ETH',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockTransfer = {
        id: 'transfer-123',
        userId: 'user-123',
        ...dto,
        status: BridgeTransferStatus.PENDING_POLICY,
      };

      mockPolicyService.checkPolicy.mockResolvedValue({ allowed: true });
      mockBridgeTransferRepository.findOne.mockResolvedValue(null);
      mockBridgeTransferRepository.create.mockReturnValue(mockTransfer);
      mockBridgeTransferRepository.save.mockResolvedValue(mockTransfer);

      const result = await service.createTransfer('user-123', dto);

      expect(result).toHaveProperty('transfer_id');
      expect(result.status).toBe(BridgeTransferStatus.PENDING_POLICY);
    });
  });

  describe('getQuote', () => {
    it('should handle different chain pairs', async () => {
      const dto: CreateBridgeQuoteDto = {
        srcChain: BridgeChain.ETHEREUM,
        dstChain: BridgeChain.TRON,
        amount: '2000000000000000000',
        asset: 'ETH',
      };

      const result = await service.getQuote(dto);

      expect(result.srcChain).toBe(BridgeChain.ETHEREUM);
      expect(result.dstChain).toBe(BridgeChain.TRON);
      expect(result.amount).toBe(dto.amount);
    });

    it('should generate unique quote ID', async () => {
      const dto: CreateBridgeQuoteDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000',
        asset: 'NOR',
      };

      const result1 = await service.getQuote(dto);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result2 = await service.getQuote(dto);

      expect(result1.quoteId).not.toBe(result2.quoteId);
    });

    it('should set expiration time', async () => {
      const dto: CreateBridgeQuoteDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000',
        asset: 'NOR',
      };

      const result = await service.getQuote(dto);

      expect(result).toHaveProperty('expiresAt');
      const expiresAt = new Date(result.expiresAt);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      expect(diff).toBeGreaterThan(0);
      expect(diff).toBeLessThanOrEqual(5 * 60 * 1000); // 5 minutes
    });
  });
});

