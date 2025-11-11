import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Validator, ValidatorStatus } from './entities/validator.entity';
import { SlashingEvent, SlashingReason } from './entities/slashing-event.entity';
import { FeatureFlag } from './entities/feature-flag.entity';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CreateValidatorDto } from './dto/create-validator.dto';
import { UpdateParamsDto } from './dto/update-params.dto';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let validatorRepository: Repository<Validator>;
  let slashingRepository: Repository<SlashingEvent>;
  let featureFlagRepository: Repository<FeatureFlag>;
  let auditLogRepository: Repository<AuditLog>;
  let rpcService: RpcService;

  const mockValidatorRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSlashingRepository = {
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockFeatureFlagRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockRpcService = {
    getProvider: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Validator),
          useValue: mockValidatorRepository,
        },
        {
          provide: getRepositoryToken(SlashingEvent),
          useValue: mockSlashingRepository,
        },
        {
          provide: getRepositoryToken(FeatureFlag),
          useValue: mockFeatureFlagRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    validatorRepository = module.get<Repository<Validator>>(getRepositoryToken(Validator));
    slashingRepository = module.get<Repository<SlashingEvent>>(getRepositoryToken(SlashingEvent));
    featureFlagRepository = module.get<Repository<FeatureFlag>>(getRepositoryToken(FeatureFlag));
    auditLogRepository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    rpcService = module.get<RpcService>(RpcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getValidators', () => {
    it('should return paginated validators', async () => {
      const mockValidators = [
        {
          id: 'validator-1',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          name: 'Validator 1',
          status: ValidatorStatus.ACTIVE,
          stake: '10000000000000000000000',
          uptime: 99.5,
          blocksProposed: 1000,
          blocksMissed: 5,
          complianceScore: 95,
          location: 'Oslo',
          lastActiveAt: new Date(),
        },
      ];

      mockValidatorRepository.findAndCount.mockResolvedValue([mockValidators, 1]);

      const result = await service.getValidators(50, 0);

      expect(result).toHaveProperty('validators');
      expect(result).toHaveProperty('total', 1);
      expect(result.validators).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockValidatorRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getValidators(50, 0, ValidatorStatus.ACTIVE);

      expect(mockValidatorRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: ValidatorStatus.ACTIVE },
        order: { stake: 'DESC' },
        take: 50,
        skip: 0,
      });
    });

    it('should return empty array when no validators found', async () => {
      mockValidatorRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getValidators(50, 0);

      expect(result.validators).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      const mockValidators = [
        {
          id: 'validator-1',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          name: 'Validator 1',
          status: ValidatorStatus.ACTIVE,
          stake: '10000000000000000000000',
          uptime: 99.5,
          blocksProposed: 1000,
          blocksMissed: 5,
          complianceScore: 95,
          location: 'Oslo',
          lastActiveAt: new Date(),
        },
      ];

      mockValidatorRepository.findAndCount.mockResolvedValue([mockValidators, 10]);

      const result = await service.getValidators(10, 5);

      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 5);
      expect(result).toHaveProperty('total', 10);
    });
  });

  describe('getValidator', () => {
    it('should return validator details with slashing events', async () => {
      const validatorId = 'validator-123';
      const mockValidator = {
        id: validatorId,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: 'Validator 1',
        status: ValidatorStatus.ACTIVE,
        stake: '10000',
        uptime: 99.5,
        blocksProposed: 1000,
        blocksMissed: 5,
        complianceScore: 95,
        location: 'Oslo',
        licenseNumber: 'LIC-001',
        metadata: {},
        lastActiveAt: new Date(),
        createdAt: new Date(),
      };

      const mockSlashingEvents = [
        {
          reason: SlashingReason.DOWNTIME,
          slashedAmount: '100',
          description: 'Downtime violation',
          txHash: '0x123',
          createdAt: new Date(),
        },
      ];

      mockValidatorRepository.findOne.mockResolvedValue(mockValidator);
      mockSlashingRepository.find.mockResolvedValue(mockSlashingEvents);

      const result = await service.getValidator(validatorId);

      expect(result).toHaveProperty('validator_id', validatorId);
      expect(result).toHaveProperty('slashingEvents');
      expect(result.slashingEvents).toHaveLength(1);
    });

    it('should return validator without slashing events', async () => {
      const validatorId = 'validator-123';
      const mockValidator = {
        id: validatorId,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: 'Validator 1',
        status: ValidatorStatus.ACTIVE,
        stake: '10000',
        uptime: 99.5,
        blocksProposed: 1000,
        blocksMissed: 5,
        complianceScore: 95,
        location: 'Oslo',
        licenseNumber: 'LIC-001',
        metadata: {},
        lastActiveAt: new Date(),
        createdAt: new Date(),
      };

      mockValidatorRepository.findOne.mockResolvedValue(mockValidator);
      mockSlashingRepository.find.mockResolvedValue([]);

      const result = await service.getValidator(validatorId);

      expect(result).toHaveProperty('validator_id', validatorId);
      expect(result).toHaveProperty('slashingEvents');
      expect(result.slashingEvents).toHaveLength(0);
    });

    it('should throw NotFoundException if validator not found', async () => {
      mockValidatorRepository.findOne.mockResolvedValue(null);

      await expect(service.getValidator('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createValidator', () => {
    it('should create a validator successfully', async () => {
      const userId = 'admin-123';
      const dto: CreateValidatorDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: 'New Validator',
        stake: '10000000000000000000000',
        licenseNumber: 'LIC-001',
        location: 'Oslo',
      };

      mockValidatorRepository.findOne.mockResolvedValue(null);
      mockValidatorRepository.create.mockReturnValue({
        ...dto,
        id: 'validator-123',
        status: ValidatorStatus.PENDING,
        address: dto.address.toLowerCase(),
      });
      mockValidatorRepository.save.mockResolvedValue({
        id: 'validator-123',
        address: dto.address.toLowerCase(),
        name: dto.name,
        status: ValidatorStatus.PENDING,
      });
      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.createValidator(userId, dto);

      expect(result).toHaveProperty('validator_id');
      expect(result).toHaveProperty('address', dto.address.toLowerCase());
      expect(mockValidatorRepository.create).toHaveBeenCalled();
      expect(mockAuditLogRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if validator already exists', async () => {
      const userId = 'admin-123';
      const dto: CreateValidatorDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: 'Existing Validator',
        stake: '10000',
      };

      mockValidatorRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.createValidator(userId, dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getSlashingEvents', () => {
    it('should return paginated slashing events', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          validatorId: 'validator-1',
          validator: {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          },
          reason: SlashingReason.DOWNTIME,
          slashedAmount: '100',
          description: 'Downtime',
          txHash: '0x123',
          blockNumber: 1000,
          createdAt: new Date(),
        },
      ];

      mockSlashingRepository.findAndCount.mockResolvedValue([mockEvents, 1]);

      const result = await service.getSlashingEvents(50, 0);

      expect(result).toHaveProperty('events');
      expect(result.events).toHaveLength(1);
    });

    it('should return empty array when no events found', async () => {
      mockSlashingRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getSlashingEvents(50, 0);

      expect(result.events).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          validatorId: 'validator-1',
          validator: {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          },
          reason: SlashingReason.DOWNTIME,
          slashedAmount: '100',
          description: 'Downtime',
          txHash: '0x123',
          blockNumber: 1000,
          createdAt: new Date(),
        },
      ];

      mockSlashingRepository.findAndCount.mockResolvedValue([mockEvents, 5]);

      const result = await service.getSlashingEvents(10, 2);

      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 2);
      expect(result).toHaveProperty('total', 5);
    });
  });

  describe('updateParams', () => {
    it('should create a parameter change proposal', async () => {
      const userId = 'admin-123';
      const dto: UpdateParamsDto = {
        parameters: { minStake: '50000' },
        reason: 'Increase minimum stake',
      };

      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.updateParams(userId, dto);

      expect(result).toHaveProperty('proposal_id');
      expect(result).toHaveProperty('parameters', dto.parameters);
      expect(mockAuditLogRepository.save).toHaveBeenCalled();
    });
  });

  describe('createFeatureFlag', () => {
    it('should create a feature flag', async () => {
      const userId = 'admin-123';
      const dto: CreateFeatureFlagDto = {
        key: 'enable_bridge_v2',
        description: 'Enable Bridge V2',
        enabled: false,
        conditions: { percentage: 10 },
      };

      mockFeatureFlagRepository.create.mockReturnValue({
        ...dto,
        id: 'flag-123',
      });
      mockFeatureFlagRepository.save.mockResolvedValue({
        id: 'flag-123',
        key: dto.key,
        enabled: dto.enabled,
      });
      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.createFeatureFlag(userId, dto);

      expect(result).toHaveProperty('flag_id');
      expect(result).toHaveProperty('key', dto.key);
    });
  });

  describe('getFeatureFlags', () => {
    it('should return all feature flags', async () => {
      const mockFlags = [
        {
          id: 'flag-1',
          key: 'enable_bridge_v2',
          description: 'Bridge V2',
          enabled: false,
          conditions: {},
        },
      ];

      mockFeatureFlagRepository.find.mockResolvedValue(mockFlags);

      const result = await service.getFeatureFlags();

      expect(result).toHaveProperty('flags');
      expect(result.flags).toHaveLength(1);
    });

    it('should return empty array when no flags exist', async () => {
      mockFeatureFlagRepository.find.mockResolvedValue([]);

      const result = await service.getFeatureFlags();

      expect(result.flags).toHaveLength(0);
    });

    it('should return flags with conditions', async () => {
      const mockFlags = [
        {
          id: 'flag-1',
          key: 'enable_bridge_v2',
          description: 'Bridge V2',
          enabled: true,
          conditions: { percentage: 50, regions: ['US', 'EU'] },
        },
      ];

      mockFeatureFlagRepository.find.mockResolvedValue(mockFlags);

      const result = await service.getFeatureFlags();

      expect(result.flags[0]).toHaveProperty('conditions');
      expect(result.flags[0].conditions).toEqual({ percentage: 50, regions: ['US', 'EU'] });
    });
  });

  describe('getAuditLog', () => {
    it('should return paginated audit logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          userId: 'user-123',
          action: AuditAction.CREATE,
          resourceType: 'validator',
          resourceId: 'validator-1',
          changes: { after: {} },
          ipAddress: '127.0.0.1',
          traceId: 'trace-123',
          createdAt: new Date(),
        },
      ];

      mockAuditLogRepository.findAndCount.mockResolvedValue([mockLogs, 1]);

      const result = await service.getAuditLog(100, 0);

      expect(result).toHaveProperty('logs');
      expect(result.logs).toHaveLength(1);
    });

    it('should filter by userId and resourceType', async () => {
      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getAuditLog(100, 0, 'user-123', 'validator');

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-123', resourceType: 'validator' },
        order: { createdAt: 'DESC' },
        take: 100,
        skip: 0,
      });
    });

    it('should filter by userId only', async () => {
      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getAuditLog(100, 0, 'user-123');

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        take: 100,
        skip: 0,
      });
    });

    it('should filter by resourceType only', async () => {
      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getAuditLog(100, 0, undefined, 'validator');

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: { resourceType: 'validator' },
        order: { createdAt: 'DESC' },
        take: 100,
        skip: 0,
      });
    });

    it('should return empty array when no logs found', async () => {
      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getAuditLog(100, 0);

      expect(result.logs).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});

