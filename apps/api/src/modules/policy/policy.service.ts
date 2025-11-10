import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyCheck, PolicyCheckStatus, PolicyCheckType } from './entities/policy-check.entity';
import { PolicyCheckDto } from './dto/policy-check.dto';
import { CacheService } from '@/common/services/cache.service';
import { createHash } from 'crypto';

export interface PolicyResult {
  allowed: boolean;
  status: PolicyCheckStatus;
  checks: Array<{
    type: PolicyCheckType;
    passed: boolean;
    reason?: string;
    details?: any;
  }>;
  riskScore: number; // 0-100
  requiresReview: boolean;
  auditHash: string;
}

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    @InjectRepository(PolicyCheck)
    private readonly policyCheckRepository: Repository<PolicyCheck>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Perform comprehensive policy checks
   */
  async checkPolicy(
    userId: string,
    dto: PolicyCheckDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<PolicyResult> {
    const checks: PolicyResult['checks'] = [];
    let riskScore = 0;
    let requiresReview = false;

    // 1. Sanctions Check
    const sanctionsCheck = await this.checkSanctions(dto.fromAddress, dto.toAddress);
    checks.push(sanctionsCheck);
    if (!sanctionsCheck.passed) {
      riskScore += 50;
    }

    // 2. KYC Tier Check
    const kycCheck = await this.checkKYCTier(userId, dto.amount);
    checks.push(kycCheck);
    if (!kycCheck.passed) {
      riskScore += 30;
      requiresReview = true;
    }

    // 3. Geo-fence Check
    const geoCheck = await this.checkGeoFence(ipAddress);
    checks.push(geoCheck);
    if (!geoCheck.passed) {
      riskScore += 20;
    }

    // 4. Velocity Check
    const velocityCheck = await this.checkVelocity(userId, dto.fromAddress, dto.amount);
    checks.push(velocityCheck);
    if (!velocityCheck.passed) {
      riskScore += 25;
      requiresReview = true;
    }

    // 5. RWA Cap Check (for asset-backed tokens)
    if (dto.asset && dto.asset !== 'NOR') {
      const rwaCheck = await this.checkRWACap(dto.asset, dto.amount);
      checks.push(rwaCheck);
      if (!rwaCheck.passed) {
        riskScore += 15;
      }
    }

    // 6. AML Heuristic Check
    const amlCheck = await this.checkAMLHeuristics(dto);
    checks.push(amlCheck);
    if (!amlCheck.passed) {
      riskScore += 35;
      requiresReview = true;
    }

    // 7. Compliance Score Check
    const complianceCheck = await this.checkComplianceScore(userId);
    checks.push(complianceCheck);
    riskScore += complianceCheck.details?.score || 0;

    // Determine final status
    const blockedChecks = checks.filter((c) => !c.passed && c.type !== PolicyCheckType.COMPLIANCE_SCORE);
    const allowed = blockedChecks.length === 0 && riskScore < 70;

    let status: PolicyCheckStatus;
    if (!allowed) {
      status = blockedChecks.some((c) =>
        [PolicyCheckType.SANCTIONS, PolicyCheckType.GEO_FENCE].includes(c.type),
      )
        ? PolicyCheckStatus.BLOCKED
        : PolicyCheckStatus.PENDING_REVIEW;
    } else {
      status = requiresReview ? PolicyCheckStatus.PENDING_REVIEW : PolicyCheckStatus.ALLOWED;
    }

    // Log policy decision
    this.logger.log(
      `Policy check for user ${userId}: ${status} (risk: ${riskScore}, checks: ${checks.length})`,
    );

    // Generate audit hash
    const auditHash = this.generateAuditHash(userId, dto, checks, status);

    // Store policy check record
    const policyCheck = this.policyCheckRepository.create({
      requestId: dto.requestId || `req_${Date.now()}`,
      userId,
      checkType: PolicyCheckType.SANCTIONS, // Primary check type
      status,
      fromAddress: dto.fromAddress,
      toAddress: dto.toAddress,
      amount: dto.amount,
      asset: dto.asset,
      metadata: {
        reason: blockedChecks.map((c) => c.reason).join('; '),
        riskFlags: checks.filter((c) => !c.passed).map((c) => c.type),
        complianceScore: riskScore,
      },
      auditHash,
      ipAddress,
      userAgent,
    });

    await this.policyCheckRepository.save(policyCheck);

    // Throw exception if blocked (for automatic rejection)
    if (!allowed && status === PolicyCheckStatus.BLOCKED) {
      const failedCheck = blockedChecks[0];
      throw new ForbiddenException(
        `Transaction blocked by policy: ${failedCheck?.reason || 'Policy check failed'}`,
      );
    }

    return {
      allowed,
      status,
      checks,
      riskScore: Math.min(100, riskScore),
      requiresReview,
      auditHash,
    };
  }

  /**
   * Check sanctions lists (OFAC, EU, UN, etc.)
   */
  private async checkSanctions(
    fromAddress?: string,
    toAddress?: string,
  ): Promise<PolicyResult['checks'][0]> {
    // In production, this would query external sanctions databases
    // For now, simulate check
    const addresses = [fromAddress, toAddress].filter(Boolean) as string[];

    // Mock: Check against known blocked addresses (would be from database)
    // In production, this would be loaded from database or external API
    const blockedAddresses: string[] = [
      '0xblockedaddress123456789012345678901234567890',
      '0xblockedaddress123456789012345678901234567890'.toLowerCase(),
    ];

    const matched = addresses.some((addr) =>
      blockedAddresses.includes(addr?.toLowerCase() || ''),
    );

    return {
      type: PolicyCheckType.SANCTIONS,
      passed: !matched,
      reason: matched ? 'Address found on sanctions list' : undefined,
      details: {
        listsChecked: ['OFAC', 'EU', 'UN'],
        matched,
      },
    };
  }

  /**
   * Check KYC tier requirements
   */
  private async checkKYCTier(userId: string, amount?: string): Promise<PolicyResult['checks'][0]> {
    // In production, this would query user's KYC status
    // Mock: Assume basic tier for now
    const kycTier = 'basic'; // Would come from user profile
    const amountValue = amount ? BigInt(amount) : 0n;
    const tierLimits: Record<string, bigint> = {
      none: 0n,
      basic: BigInt('1000000000000000000000'), // 1000 tokens
      verified: BigInt('100000000000000000000000'), // 100,000 tokens
      enterprise: BigInt('999999999999999999999999999'), // Unlimited
    };

    const limit = tierLimits[kycTier] || 0n;
    const passed = amountValue <= limit;

    return {
      type: PolicyCheckType.KYC_TIER,
      passed,
      reason: !passed ? `Amount exceeds ${kycTier} tier limit` : undefined,
      details: {
        kycTier,
        limit: limit.toString(),
        amount: amount || '0',
      },
    };
  }

  /**
   * Check geo-fencing restrictions
   */
  private async checkGeoFence(ipAddress?: string): Promise<PolicyResult['checks'][0]> {
    // In production, this would use IP geolocation service
    // Mock: Allow all for now
    const blockedCountries: string[] = []; // Would be from config
    const country = 'US'; // Would be resolved from IP

    const blocked = blockedCountries.includes(country);

    return {
      type: PolicyCheckType.GEO_FENCE,
      passed: !blocked,
      reason: blocked ? `Transactions from ${country} are blocked` : undefined,
      details: {
        country,
        ipAddress,
        blocked,
      },
    };
  }

  /**
   * Check velocity limits (anti-abuse)
   */
  private async checkVelocity(
    userId: string,
    address?: string,
    amount?: string,
  ): Promise<PolicyResult['checks'][0]> {
    // Check daily transaction count and value
    const cacheKey = `velocity:${userId}:${new Date().toISOString().split('T')[0]}`;
    const velocityData = await this.cacheService.get<{
      txCount: number;
      totalValue: string;
    }>(cacheKey) || { txCount: 0, totalValue: '0' };

    const dailyTxLimit = 100;
    const dailyValueLimit = BigInt('10000000000000000000000'); // 10,000 tokens
    const amountValue = amount ? BigInt(amount) : 0n;

    const txCountPassed = velocityData.txCount < dailyTxLimit;
    const valuePassed =
      BigInt(velocityData.totalValue) + amountValue <= dailyValueLimit;

    const passed = txCountPassed && valuePassed;

    // Update cache
    if (passed) {
      await this.cacheService.set(cacheKey, {
        txCount: velocityData.txCount + 1,
        totalValue: (BigInt(velocityData.totalValue) + amountValue).toString(),
      }, 86400); // 24 hours
    }

    return {
      type: PolicyCheckType.VELOCITY,
      passed,
      reason: !passed
        ? `Daily limit exceeded: ${!txCountPassed ? 'transaction count' : 'value'}`
        : undefined,
      details: {
        dailyTxLimit,
        dailyValueLimit: dailyValueLimit.toString(),
        currentTxCount: velocityData.txCount,
        currentValue: velocityData.totalValue,
      },
    };
  }

  /**
   * Check RWA (Real-World Asset) supply caps
   */
  private async checkRWACap(asset: string, amount?: string): Promise<PolicyResult['checks'][0]> {
    // In production, this would check token supply caps
    // Mock: Assume unlimited for now
    const caps: Record<string, string> = {
      BTCBR: '1000000000000000000000', // 1000 BTC
      ETHBR: '10000000000000000000000', // 10,000 ETH
    };

    const cap = caps[asset];
    if (!cap) {
      return {
        type: PolicyCheckType.RWA_CAP,
        passed: true,
        details: { asset, cap: 'unlimited' },
      };
    }

    // Would check current supply + amount against cap
    const passed = true; // Simplified

    return {
      type: PolicyCheckType.RWA_CAP,
      passed,
      details: {
        asset,
        cap,
        currentSupply: '0', // Would be from database
      },
    };
  }

  /**
   * Check AML heuristics (pattern detection)
   */
  private async checkAMLHeuristics(dto: PolicyCheckDto): Promise<PolicyResult['checks'][0]> {
    // In production, this would use ML models or rule-based detection
    // Check for suspicious patterns:
    // - Round numbers (often used in money laundering)
    // - Rapid successive transactions
    // - Unusual amounts

    const amountValue = dto.amount ? BigInt(dto.amount) : 0n;
    const isRoundNumber = amountValue % BigInt('1000000000000000000') === 0n; // Round to 1 token

    // Mock: Flag round numbers above threshold as suspicious
    const suspicious = isRoundNumber && amountValue > BigInt('100000000000000000000'); // > 100 tokens

    return {
      type: PolicyCheckType.AML_HEURISTIC,
      passed: !suspicious,
      reason: suspicious ? 'Suspicious transaction pattern detected' : undefined,
      details: {
        isRoundNumber,
        amount: dto.amount || '0',
      },
    };
  }

  /**
   * Check user's compliance score
   */
  private async checkComplianceScore(userId: string): Promise<PolicyResult['checks'][0]> {
    // In production, this would calculate from user's transaction history
    // Mock: Return neutral score
    const score = 50; // 0-100, higher is better

    return {
      type: PolicyCheckType.COMPLIANCE_SCORE,
      passed: score >= 30, // Minimum threshold
      details: {
        score,
        threshold: 30,
      },
    };
  }

  /**
   * Generate audit hash for L1 anchoring
   */
  private generateAuditHash(
    userId: string,
    dto: PolicyCheckDto,
    checks: PolicyResult['checks'],
    status: PolicyCheckStatus,
  ): string {
    const data = JSON.stringify({
      userId,
      fromAddress: dto.fromAddress,
      toAddress: dto.toAddress,
      amount: dto.amount,
      asset: dto.asset,
      checks: checks.map((c) => ({ type: c.type, passed: c.passed })),
      status,
      timestamp: new Date().toISOString(),
    });

    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get policy check history
   */
  async getPolicyCheckHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const [checks, total] = await this.policyCheckRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      checks: checks.map((c) => ({
        id: c.id,
        requestId: c.requestId,
        checkType: c.checkType,
        status: c.status,
        fromAddress: c.fromAddress,
        toAddress: c.toAddress,
        amount: c.amount,
        asset: c.asset,
        metadata: c.metadata,
        auditHash: c.auditHash,
        createdAt: c.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }
}

