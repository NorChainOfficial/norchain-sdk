import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Validator, ValidatorStatus } from './entities/validator.entity';
import { SlashingEvent, SlashingReason } from './entities/slashing-event.entity';
import { FeatureFlag } from './entities/feature-flag.entity';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { CreateValidatorDto } from './dto/create-validator.dto';
import { UpdateParamsDto } from './dto/update-params.dto';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { RpcService } from '@/common/services/rpc.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Validator)
    private readonly validatorRepository: Repository<Validator>,
    @InjectRepository(SlashingEvent)
    private readonly slashingRepository: Repository<SlashingEvent>,
    @InjectRepository(FeatureFlag)
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly rpcService: RpcService,
  ) {}

  /**
   * Get all validators
   */
  async getValidators(limit: number = 50, offset: number = 0, status?: ValidatorStatus) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [validators, total] = await this.validatorRepository.findAndCount({
      where,
      order: { stake: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      validators: validators.map((v) => ({
        validator_id: v.id,
        address: v.address,
        name: v.name,
        status: v.status,
        stake: v.stake,
        uptime: v.uptime,
        blocksProposed: v.blocksProposed,
        blocksMissed: v.blocksMissed,
        complianceScore: v.complianceScore,
        location: v.location,
        lastActiveAt: v.lastActiveAt,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get validator details
   */
  async getValidator(validatorId: string) {
    const validator = await this.validatorRepository.findOne({
      where: { id: validatorId },
      relations: [],
    });

    if (!validator) {
      throw new NotFoundException('Validator not found');
    }

    // Get slashing events
    const slashingEvents = await this.slashingRepository.find({
      where: { validatorId: validator.id },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      validator_id: validator.id,
      address: validator.address,
      name: validator.name,
      status: validator.status,
      stake: validator.stake,
      uptime: validator.uptime,
      blocksProposed: validator.blocksProposed,
      blocksMissed: validator.blocksMissed,
      complianceScore: validator.complianceScore,
      location: validator.location,
      licenseNumber: validator.licenseNumber,
      metadata: validator.metadata,
      lastActiveAt: validator.lastActiveAt,
      slashingEvents: slashingEvents.map((e) => ({
        reason: e.reason,
        slashedAmount: e.slashedAmount,
        description: e.description,
        txHash: e.txHash,
        createdAt: e.createdAt,
      })),
      createdAt: validator.createdAt,
    };
  }

  /**
   * Create validator (admin only)
   */
  async createValidator(userId: string, dto: CreateValidatorDto) {
    // Check if validator already exists
    const existing = await this.validatorRepository.findOne({
      where: { address: dto.address.toLowerCase() },
    });

    if (existing) {
      throw new ForbiddenException('Validator already exists');
    }

    const validator = this.validatorRepository.create({
      address: dto.address.toLowerCase(),
      name: dto.name,
      stake: dto.stake,
      status: ValidatorStatus.PENDING,
      licenseNumber: dto.licenseNumber,
      location: dto.location,
      metadata: dto.metadata,
    });

    const savedValidator = await this.validatorRepository.save(validator);

    // Log audit
    await this.logAudit(userId, AuditAction.CREATE, 'validator', savedValidator.id, {
      after: { address: savedValidator.address, name: savedValidator.name },
    });

    return {
      validator_id: savedValidator.id,
      address: savedValidator.address,
      name: savedValidator.name,
      status: savedValidator.status,
    };
  }

  /**
   * Get slashing events
   */
  async getSlashingEvents(limit: number = 50, offset: number = 0) {
    const [events, total] = await this.slashingRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['validator'],
    });

    return {
      events: events.map((e) => ({
        event_id: e.id,
        validatorId: e.validatorId,
        validatorAddress: e.validator.address,
        reason: e.reason,
        slashedAmount: e.slashedAmount,
        description: e.description,
        txHash: e.txHash,
        blockNumber: e.blockNumber,
        createdAt: e.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Update system parameters (creates governance proposal)
   */
  async updateParams(userId: string, dto: UpdateParamsDto) {
    // In production, this would create a governance proposal
    // For now, return a proposal ID

    // Log audit
    await this.logAudit(userId, AuditAction.EXECUTE, 'params', 'system', {
      after: dto.parameters,
    });

    return {
      proposal_id: `prop_${Date.now()}`,
      parameters: dto.parameters,
      reason: dto.reason,
      message: 'Parameter change proposal created. Requires governance approval.',
    };
  }

  /**
   * Create feature flag
   */
  async createFeatureFlag(userId: string, dto: CreateFeatureFlagDto) {
    const flag = this.featureFlagRepository.create({
      key: dto.key,
      description: dto.description,
      enabled: dto.enabled || false,
      conditions: dto.conditions || {},
    });

    const savedFlag = await this.featureFlagRepository.save(flag);

    // Log audit
    await this.logAudit(userId, AuditAction.CREATE, 'feature_flag', savedFlag.id, {
      after: { key: savedFlag.key, enabled: savedFlag.enabled },
    });

    return {
      flag_id: savedFlag.id,
      key: savedFlag.key,
      enabled: savedFlag.enabled,
    };
  }

  /**
   * Get feature flags
   */
  async getFeatureFlags() {
    const flags = await this.featureFlagRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      flags: flags.map((f) => ({
        flag_id: f.id,
        key: f.key,
        description: f.description,
        enabled: f.enabled,
        conditions: f.conditions,
      })),
    };
  }

  /**
   * Get audit log
   */
  async getAuditLog(
    limit: number = 100,
    offset: number = 0,
    userId?: string,
    resourceType?: string,
  ) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (resourceType) {
      where.resourceType = resourceType;
    }

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      logs: logs.map((l) => ({
        log_id: l.id,
        userId: l.userId,
        action: l.action,
        resourceType: l.resourceType,
        resourceId: l.resourceId,
        changes: l.changes,
        ipAddress: l.ipAddress,
        traceId: l.traceId,
        createdAt: l.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Log audit event
   */
  private async logAudit(
    userId: string,
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    changes: { before?: any; after?: any },
  ) {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      resourceType,
      resourceId,
      changes,
    });

    await this.auditLogRepository.save(auditLog);
  }
}

