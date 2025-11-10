import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ComplianceScreening,
  ScreeningStatus,
  ScreeningType,
} from './entities/compliance-screening.entity';
import {
  ComplianceCase,
  CaseStatus,
  CaseSeverity,
} from './entities/compliance-case.entity';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { CreateCaseDto } from './dto/create-case.dto';
import { TravelRuleDto } from './dto/travel-rule.dto';
import { TravelRulePrecheckDto } from './dto/travel-rule-precheck.dto';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceScreening)
    private readonly screeningRepository: Repository<ComplianceScreening>,
    @InjectRepository(ComplianceCase)
    private readonly caseRepository: Repository<ComplianceCase>,
  ) {}

  /**
   * Create a compliance screening
   */
  async createScreening(userId: string, dto: CreateScreeningDto) {
    // In production, this would call external screening services (OFAC, etc.)
    // For now, simulate screening results
    const results = await this.performScreening(dto.type, dto.subject);

    const screening = this.screeningRepository.create({
      userId,
      type: dto.type,
      subject: dto.subject,
      status: results.hasMatches
        ? ScreeningStatus.FLAGGED
        : ScreeningStatus.CLEARED,
      results: {
        listsChecked: results.listsChecked,
        matches: results.matches,
        riskScore: results.riskScore,
      },
      notes: dto.notes,
    });

    const savedScreening = await this.screeningRepository.save(screening);

    // Auto-create case if high risk
    if (results.riskScore >= 80) {
      await this.caseRepository.save(
        this.caseRepository.create({
          subject: dto.subject,
          description: `High-risk screening result (score: ${results.riskScore})`,
          severity: CaseSeverity.HIGH,
          status: CaseStatus.OPEN,
          relatedScreenings: [savedScreening.id],
        }),
      );
    }

    return {
      screening_id: savedScreening.id,
      status: savedScreening.status,
      riskScore: results.riskScore,
      hasMatches: results.hasMatches,
      matches: results.matches,
    };
  }

  /**
   * Get screening details
   */
  async getScreening(userId: string, screeningId: string) {
    const screening = await this.screeningRepository.findOne({
      where: { id: screeningId, userId },
    });

    if (!screening) {
      throw new NotFoundException('Screening not found');
    }

    return {
      screening_id: screening.id,
      type: screening.type,
      subject: screening.subject,
      status: screening.status,
      results: screening.results,
      notes: screening.notes,
      createdAt: screening.createdAt,
      updatedAt: screening.updatedAt,
    };
  }

  /**
   * Get risk score for an address
   */
  async getRiskScore(address: string) {
    // Get latest screening for address
    const screening = await this.screeningRepository.findOne({
      where: { subject: address },
      order: { createdAt: 'DESC' },
    });

    if (!screening) {
      // Return default risk score if no screening exists
      return {
        address,
        riskScore: 0,
        status: 'not_screened',
        lastScreened: null,
      };
    }

    return {
      address,
      riskScore: screening.results?.riskScore || 0,
      status: screening.status,
      lastScreened: screening.createdAt,
      matches: screening.results?.matches || [],
    };
  }

  /**
   * Create a compliance case
   */
  async createCase(userId: string, dto: CreateCaseDto) {
    const case_ = this.caseRepository.create({
      subject: dto.subject,
      description: dto.description,
      severity: dto.severity,
      status: CaseStatus.OPEN,
      relatedScreenings: dto.relatedScreenings || [],
    });

    const savedCase = await this.caseRepository.save(case_);

    return {
      case_id: savedCase.id,
      subject: savedCase.subject,
      status: savedCase.status,
      severity: savedCase.severity,
      createdAt: savedCase.createdAt,
    };
  }

  /**
   * Get case details
   */
  async getCase(userId: string, caseId: string) {
    const case_ = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!case_) {
      throw new NotFoundException('Case not found');
    }

    return {
      case_id: case_.id,
      subject: case_.subject,
      status: case_.status,
      severity: case_.severity,
      description: case_.description,
      relatedScreenings: case_.relatedScreenings,
      notes: case_.notes,
      assignedTo: case_.assignedTo,
      createdAt: case_.createdAt,
      resolvedAt: case_.resolvedAt,
    };
  }

  /**
   * Precheck Travel Rule requirements before payment
   */
  async precheckTravelRule(dto: TravelRulePrecheckDto) {
    // Check if Travel Rule is required (typically for amounts above threshold)
    const amount = parseFloat(dto.amount);
    const TRAVEL_RULE_THRESHOLD = 1000; // Example threshold in native currency

    const requiresTravelRule = amount >= TRAVEL_RULE_THRESHOLD;

    // Check if both addresses are VASPs (would query VASP registry)
    const senderIsVASP = await this.checkIfVASP(dto.senderAddress);
    const recipientIsVASP = await this.checkIfVASP(dto.recipientAddress);

    const isVASPToVASP = senderIsVASP && recipientIsVASP;

    return {
      requiresTravelRule,
      isVASPToVASP,
      threshold: TRAVEL_RULE_THRESHOLD.toString(),
      amount: dto.amount,
      recommendation: requiresTravelRule && isVASPToVASP
        ? 'Travel Rule compliance required'
        : 'No Travel Rule required',
    };
  }

  /**
   * Check if address belongs to a VASP
   */
  private async checkIfVASP(address: string): Promise<boolean> {
    // In production, query VASP registry
    // For now, simulate check
    return false; // Default: not a VASP
  }

  /**
   * Submit Travel Rule information
   */
  async submitTravelRule(userId: string, dto: TravelRuleDto) {
    // In production, this would:
    // 1. Validate Travel Rule requirements (amount thresholds)
    // 2. Encrypt and store PII securely
    // 3. Notify recipient's VASP (Virtual Asset Service Provider)
    // 4. Create audit log

    const travelRuleRecord = {
      id: `tr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderAddress: dto.senderAddress,
      recipientAddress: dto.recipientAddress,
      amount: dto.amount,
      asset: dto.asset,
      timestamp: new Date().toISOString(),
      status: 'submitted',
    };

    // Store in database (would need TravelRule entity)
    // For now, return the record

    return {
      travel_rule_id: travelRuleRecord.id,
      status: travelRuleRecord.status,
      message: 'Travel Rule information submitted successfully',
    };
  }

  /**
   * Perform screening (simulated)
   */
  private async performScreening(type: ScreeningType, subject: string) {
    // Simulate screening against various lists
    const listsChecked = [
      'OFAC',
      'EU_SANCTIONS',
      'UN_SANCTIONS',
      'INTERNAL_WATCHLIST',
    ];
    const matches: Array<{ list: string; matchType: string; details: any }> =
      [];
    let riskScore = 0;

    // Simulate matches (in production, this would query real screening APIs)
    if (subject.toLowerCase().includes('test')) {
      matches.push({
        list: 'INTERNAL_WATCHLIST',
        matchType: 'partial',
        details: { reason: 'Test address' },
      });
      riskScore += 30;
    }

    // Random risk score for demonstration
    riskScore += Math.floor(Math.random() * 50);

    return {
      listsChecked,
      matches,
      riskScore: Math.min(riskScore, 100),
      hasMatches: matches.length > 0 || riskScore >= 70,
    };
  }
}
