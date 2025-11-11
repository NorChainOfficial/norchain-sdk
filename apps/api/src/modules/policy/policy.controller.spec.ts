import { Test, TestingModule } from '@nestjs/testing';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
import { PolicyCheckDto } from './dto/policy-check.dto';
import { PolicyCheckStatus } from './entities/policy-check.entity';
import { ForbiddenException } from '@nestjs/common';

describe('PolicyController', () => {
  let controller: PolicyController;
  let policyService: jest.Mocked<PolicyService>;

  const mockPolicyService = {
    checkPolicy: jest.fn(),
    getPolicyCheckHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolicyController],
      providers: [
        {
          provide: PolicyService,
          useValue: mockPolicyService,
        },
      ],
    }).compile();

    controller = module.get<PolicyController>(PolicyController);
    policyService = module.get(PolicyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkPolicy', () => {
    it('should return policy check result for allowed transaction', async () => {
      const userId = 'user-123';
      const dto: PolicyCheckDto = {
        amount: '1000000000000000000',
        asset: 'NOR',
        fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        toAddress: '0x1234567890123456789012345678901234567890',
      };

      const mockResult = {
        allowed: true,
        status: PolicyCheckStatus.ALLOWED,
        checks: [
          { type: 'sanctions', passed: true, reason: null, details: {} },
          { type: 'kyc', passed: true, reason: null, details: {} },
        ],
        riskScore: 10,
        requiresReview: false,
        auditHash: 'hash-123',
      };

      mockPolicyService.checkPolicy.mockResolvedValue(mockResult);

      const result = await controller.checkPolicy(
        { user: { id: userId } },
        dto,
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toEqual(mockResult);
      expect(policyService.checkPolicy).toHaveBeenCalledWith(
        userId,
        dto,
        '127.0.0.1',
        'test-agent',
      );
    });

    it('should return pending review result', async () => {
      const userId = 'user-123';
      const dto: PolicyCheckDto = {
        amount: '5000000000000000000000',
        asset: 'NOR',
        fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        toAddress: '0x1234567890123456789012345678901234567890',
      };

      const mockResult = {
        allowed: false,
        status: PolicyCheckStatus.PENDING_REVIEW,
        checks: [
          { type: 'sanctions', passed: true, reason: null, details: {} },
          { type: 'amount', passed: false, reason: 'High amount', details: {} },
        ],
        riskScore: 65,
        requiresReview: true,
        auditHash: 'hash-456',
      };

      mockPolicyService.checkPolicy.mockResolvedValue(mockResult);

      const result = await controller.checkPolicy(
        { user: { id: userId } },
        dto,
        '127.0.0.1',
        'test-agent',
      );

      expect(result.status).toBe(PolicyCheckStatus.PENDING_REVIEW);
      expect(result.requiresReview).toBe(true);
    });

    it('should handle blocked transactions', async () => {
      const userId = 'user-123';
      const dto: PolicyCheckDto = {
        amount: '1000000000000000000',
        asset: 'NOR',
        fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        toAddress: '0xSANCTIONED_ADDRESS',
      };

      mockPolicyService.checkPolicy.mockRejectedValue(
        new ForbiddenException('Transaction blocked by policy'),
      );

      await expect(
        controller.checkPolicy(
          { user: { id: userId } },
          dto,
          '127.0.0.1',
          'test-agent',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getHistory', () => {
    it('should return policy check history', async () => {
      const userId = 'user-123';
      const limit = 50;
      const offset = 0;

      const mockResult = {
        checks: [
          {
            id: 'check-1',
            userId: 'user-123',
            status: PolicyCheckStatus.ALLOWED,
            riskScore: 10,
            createdAt: new Date(),
          },
          {
            id: 'check-2',
            userId: 'user-123',
            status: PolicyCheckStatus.BLOCKED,
            riskScore: 90,
            createdAt: new Date(),
          },
        ],
        total: 2,
        limit,
        offset,
      };

      mockPolicyService.getPolicyCheckHistory.mockResolvedValue(mockResult);

      const result = await controller.getHistory(
        { user: { id: userId } },
        limit,
        offset,
      );

      expect(result).toEqual(mockResult);
      expect(policyService.getPolicyCheckHistory).toHaveBeenCalledWith(
        userId,
        limit,
        offset,
      );
    });

    it('should use default limit and offset', async () => {
      const userId = 'user-123';
      const mockResult = {
        checks: [],
        total: 0,
        limit: 50,
        offset: 0,
      };

      mockPolicyService.getPolicyCheckHistory.mockResolvedValue(mockResult);

      await controller.getHistory({ user: { id: userId } }, 50, 0);

      expect(policyService.getPolicyCheckHistory).toHaveBeenCalledWith(
        userId,
        50,
        0,
      );
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user-123';
      const limit = 10;
      const offset = 20;

      const mockResult = {
        checks: [],
        total: 0,
        limit,
        offset,
      };

      mockPolicyService.getPolicyCheckHistory.mockResolvedValue(mockResult);

      await controller.getHistory({ user: { id: userId } }, limit, offset);

      expect(policyService.getPolicyCheckHistory).toHaveBeenCalledWith(
        userId,
        limit,
        offset,
      );
    });
  });
});

