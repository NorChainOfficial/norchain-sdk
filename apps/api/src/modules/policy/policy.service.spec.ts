import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PolicyService } from './policy.service';
import { PolicyCheck, PolicyCheckStatus } from './entities/policy-check.entity';
import { CacheService } from '@/common/services/cache.service';
import { PolicyCheckDto } from './dto/policy-check.dto';

describe('PolicyService', () => {
  let service: PolicyService;
  let policyCheckRepository: Repository<PolicyCheck>;
  let cacheService: CacheService;

  const mockPolicyCheckRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyService,
        {
          provide: getRepositoryToken(PolicyCheck),
          useValue: mockPolicyCheckRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PolicyService>(PolicyService);
    policyCheckRepository = module.get<Repository<PolicyCheck>>(getRepositoryToken(PolicyCheck));
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPolicy', () => {
    it('should allow transaction when all checks pass', async () => {
      const userId = 'user-123';
      const dto: PolicyCheckDto = {
        fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        toAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000',
        asset: 'NOR',
      };

      mockCacheService.get.mockResolvedValue({ txCount: 0, totalValue: '0' });
      mockPolicyCheckRepository.create.mockReturnValue({
        id: 'check-123',
        ...dto,
        status: PolicyCheckStatus.ALLOWED,
      });
      mockPolicyCheckRepository.save.mockResolvedValue({});

      const result = await service.checkPolicy(userId, dto, '127.0.0.1', 'test-agent');

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('riskScore');
      expect(result).toHaveProperty('auditHash');
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('should block transaction when sanctions check fails', async () => {
      const userId = 'user-123';
      const dto: PolicyCheckDto = {
        fromAddress: '0xblockedaddress123456789012345678901234567890',
        toAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000',
      };

      mockCacheService.get.mockResolvedValue({ txCount: 0, totalValue: '0' });
      mockPolicyCheckRepository.create.mockReturnValue({
        id: 'check-123',
        status: PolicyCheckStatus.BLOCKED,
      });
      mockPolicyCheckRepository.save.mockResolvedValue({});

      // PolicyService throws ForbiddenException when blocked
      await expect(service.checkPolicy(userId, dto)).rejects.toThrow();
    });

    it('should flag for review when velocity limit exceeded', async () => {
      const userId = 'user-123';
      const dto: PolicyCheckDto = {
        fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        amount: '1000000000000000000',
      };

      // Simulate velocity limit exceeded
      mockCacheService.get.mockResolvedValue({
        txCount: 100,
        totalValue: '10000000000000000000000',
      });
      mockPolicyCheckRepository.create.mockReturnValue({
        id: 'check-123',
        status: PolicyCheckStatus.PENDING_REVIEW,
      });
      mockPolicyCheckRepository.save.mockResolvedValue({});

      const result = await service.checkPolicy(userId, dto);

      expect(result.requiresReview).toBe(true);
    });
  });

  describe('getPolicyCheckHistory', () => {
    it('should return paginated policy check history', async () => {
      const userId = 'user-123';
      const mockChecks = [
        {
          id: 'check-1',
          requestId: 'req-1',
          checkType: 'sanctions',
          status: PolicyCheckStatus.ALLOWED,
          createdAt: new Date(),
        },
      ];

      mockPolicyCheckRepository.findAndCount.mockResolvedValue([mockChecks, 1]);

      const result = await service.getPolicyCheckHistory(userId, 50, 0);

      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('total', 1);
      expect(result.checks).toHaveLength(1);
    });
  });
});

