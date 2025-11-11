import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CreateValidatorDto } from './dto/create-validator.dto';
import { UpdateParamsDto } from './dto/update-params.dto';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { ValidatorStatus } from './entities/validator.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: jest.Mocked<AdminService>;

  const mockAdminService = {
    getValidators: jest.fn(),
    getValidator: jest.fn(),
    createValidator: jest.fn(),
    getSlashingEvents: jest.fn(),
    updateParams: jest.fn(),
    getFeatureFlags: jest.fn(),
    createFeatureFlag: jest.fn(),
    getAuditLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getValidators', () => {
    it('should return paginated validators', async () => {
      const mockResult = {
        validators: [
          {
            validator_id: 'validator-1',
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            name: 'Validator 1',
            status: ValidatorStatus.ACTIVE,
            stake: '10000000000000000000000',
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      };

      mockAdminService.getValidators.mockResolvedValue(mockResult);

      const result = await controller.getValidators(50, 0);

      expect(result).toEqual(mockResult);
      expect(adminService.getValidators).toHaveBeenCalledWith(50, 0, undefined);
    });

    it('should filter by status', async () => {
      const mockResult = {
        validators: [],
        total: 0,
        limit: 50,
        offset: 0,
      };

      mockAdminService.getValidators.mockResolvedValue(mockResult);

      const result = await controller.getValidators(50, 0, ValidatorStatus.ACTIVE);

      expect(result).toEqual(mockResult);
      expect(adminService.getValidators).toHaveBeenCalledWith(
        50,
        0,
        ValidatorStatus.ACTIVE,
      );
    });

    it('should use default limit and offset', async () => {
      const mockResult = {
        validators: [],
        total: 0,
        limit: 50,
        offset: 0,
      };

      mockAdminService.getValidators.mockResolvedValue(mockResult);

      await controller.getValidators(50, 0);

      expect(adminService.getValidators).toHaveBeenCalledWith(50, 0, undefined);
    });
  });

  describe('getValidator', () => {
    it('should return validator details', async () => {
      const validatorId = 'validator-123';
      const mockResult = {
        validator_id: validatorId,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: 'Validator 1',
        status: ValidatorStatus.ACTIVE,
        slashingEvents: [],
      };

      mockAdminService.getValidator.mockResolvedValue(mockResult);

      const result = await controller.getValidator(validatorId);

      expect(result).toEqual(mockResult);
      expect(adminService.getValidator).toHaveBeenCalledWith(validatorId);
    });

    it('should throw NotFoundException when validator not found', async () => {
      mockAdminService.getValidator.mockRejectedValue(
        new NotFoundException('Validator not found'),
      );

      await expect(controller.getValidator('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createValidator', () => {
    it('should create a validator', async () => {
      const userId = 'admin-123';
      const dto: CreateValidatorDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: 'New Validator',
        stake: '10000000000000000000000',
        licenseNumber: 'LIC-001',
        location: 'Oslo',
      };

      const mockResult = {
        validator_id: 'validator-123',
        address: dto.address.toLowerCase(),
        name: dto.name,
        status: ValidatorStatus.PENDING,
      };

      mockAdminService.createValidator.mockResolvedValue(mockResult);

      const result = await controller.createValidator(
        { user: { id: userId } },
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(adminService.createValidator).toHaveBeenCalledWith(userId, dto);
    });

    it('should throw ForbiddenException when validator already exists', async () => {
      const userId = 'admin-123';
      const dto: CreateValidatorDto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: 'Existing Validator',
        stake: '10000',
      };

      mockAdminService.createValidator.mockRejectedValue(
        new ForbiddenException('Validator already exists'),
      );

      await expect(
        controller.createValidator({ user: { id: userId } }, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getSlashingEvents', () => {
    it('should return paginated slashing events', async () => {
      const mockResult = {
        events: [
          {
            event_id: 'event-1',
            validatorId: 'validator-1',
            validatorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            reason: 'downtime',
            slashedAmount: '100',
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      };

      mockAdminService.getSlashingEvents.mockResolvedValue(mockResult);

      const result = await controller.getSlashingEvents(50, 0);

      expect(result).toEqual(mockResult);
      expect(adminService.getSlashingEvents).toHaveBeenCalledWith(50, 0);
    });

    it('should use default limit and offset', async () => {
      const mockResult = {
        events: [],
        total: 0,
        limit: 50,
        offset: 0,
      };

      mockAdminService.getSlashingEvents.mockResolvedValue(mockResult);

      await controller.getSlashingEvents(50, 0);

      expect(adminService.getSlashingEvents).toHaveBeenCalledWith(50, 0);
    });
  });

  describe('updateParams', () => {
    it('should create a parameter change proposal', async () => {
      const userId = 'admin-123';
      const dto: UpdateParamsDto = {
        parameters: { minStake: '50000' },
        reason: 'Increase minimum stake',
      };

      const mockResult = {
        proposal_id: 'prop_123',
        parameters: dto.parameters,
        reason: dto.reason,
        message: 'Parameter change proposal created. Requires governance approval.',
      };

      mockAdminService.updateParams.mockResolvedValue(mockResult);

      const result = await controller.updateParams({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(adminService.updateParams).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getFeatureFlags', () => {
    it('should return all feature flags', async () => {
      const mockResult = {
        flags: [
          {
            flag_id: 'flag-1',
            key: 'enable_bridge_v2',
            description: 'Bridge V2',
            enabled: false,
            conditions: {},
          },
        ],
      };

      mockAdminService.getFeatureFlags.mockResolvedValue(mockResult);

      const result = await controller.getFeatureFlags();

      expect(result).toEqual(mockResult);
      expect(adminService.getFeatureFlags).toHaveBeenCalled();
    });

    it('should return empty array when no flags exist', async () => {
      const mockResult = {
        flags: [],
      };

      mockAdminService.getFeatureFlags.mockResolvedValue(mockResult);

      const result = await controller.getFeatureFlags();

      expect(result.flags).toHaveLength(0);
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

      const mockResult = {
        flag_id: 'flag-123',
        key: dto.key,
        enabled: dto.enabled,
      };

      mockAdminService.createFeatureFlag.mockResolvedValue(mockResult);

      const result = await controller.createFeatureFlag(
        { user: { id: userId } },
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(adminService.createFeatureFlag).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getAuditLog', () => {
    it('should return paginated audit logs', async () => {
      const mockResult = {
        logs: [
          {
            log_id: 'log-1',
            userId: 'user-123',
            action: 'CREATE',
            resourceType: 'validator',
            resourceId: 'validator-1',
            changes: { after: {} },
            createdAt: new Date(),
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
      };

      mockAdminService.getAuditLog.mockResolvedValue(mockResult);

      const result = await controller.getAuditLog(100, 0);

      expect(result).toEqual(mockResult);
      expect(adminService.getAuditLog).toHaveBeenCalledWith(100, 0, undefined, undefined);
    });

    it('should filter by userId and resourceType', async () => {
      const mockResult = {
        logs: [],
        total: 0,
        limit: 100,
        offset: 0,
      };

      mockAdminService.getAuditLog.mockResolvedValue(mockResult);

      await controller.getAuditLog(100, 0, 'user-123', 'validator');

      expect(adminService.getAuditLog).toHaveBeenCalledWith(
        100,
        0,
        'user-123',
        'validator',
      );
    });

    it('should use default limit and offset', async () => {
      const mockResult = {
        logs: [],
        total: 0,
        limit: 100,
        offset: 0,
      };

      mockAdminService.getAuditLog.mockResolvedValue(mockResult);

      await controller.getAuditLog(100, 0);

      expect(adminService.getAuditLog).toHaveBeenCalledWith(100, 0, undefined, undefined);
    });
  });
});

