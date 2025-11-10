import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { randomBytes } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AssetProfile,
  AssetType,
  TrustLevel,
  ReviewState,
  AttestationMethod,
} from './entities/asset-profile.entity';
import { OwnershipChallenge } from './entities/ownership-challenge.entity';
import { AssetProfileVersion } from './entities/asset-profile-version.entity';
import { CommunityAttestation } from './entities/community-attestation.entity';
import { AssetReport } from './entities/asset-report.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitProfileDto } from './dto/submit-profile.dto';
import { RpcService } from '@/common/services/rpc.service';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(
    @InjectRepository(AssetProfile)
    private readonly profileRepository: Repository<AssetProfile>,
    @InjectRepository(OwnershipChallenge)
    private readonly challengeRepository: Repository<OwnershipChallenge>,
    @InjectRepository(AssetProfileVersion)
    private readonly versionRepository: Repository<AssetProfileVersion>,
    @InjectRepository(CommunityAttestation)
    private readonly attestationRepository: Repository<CommunityAttestation>,
    @InjectRepository(AssetReport)
    private readonly reportRepository: Repository<AssetReport>,
    private readonly rpcService: RpcService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create ownership challenge for signing
   */
  async createChallenge(
    userId: string,
    dto: CreateChallengeDto,
  ): Promise<{ challengeId: string; message: string; expiresAt: Date }> {
    const nonce = randomBytes(16).toString('hex');
    const message = `NorChain Metadata Claim\n\nChain: ${dto.chainId}\nAddress: ${dto.address}\nNonce: ${nonce}\n\nSign this message to prove ownership.`;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes TTL

    const challenge = this.challengeRepository.create({
      chainId: dto.chainId,
      address: dto.address,
      message,
      nonce,
      expiresAt,
      createdBy: userId,
    });

    const saved = await this.challengeRepository.save(challenge);

    return {
      challengeId: saved.id,
      message,
      expiresAt: saved.expiresAt,
    };
  }

  /**
   * Verify signature and submit/update profile
   */
  async submitProfile(
    userId: string,
    dto: SubmitProfileDto,
  ): Promise<AssetProfile> {
    // Load and validate challenge
    const challenge = await this.challengeRepository.findOne({
      where: { id: dto.attestation.challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (new Date() > challenge.expiresAt) {
      throw new BadRequestException('Challenge expired');
    }

    // Verify signature
    await this.verifySignature(
      challenge.address,
      challenge.message,
      dto.attestation.signature,
      dto.attestation.method,
    );

    // Check for existing profile
    const existing = await this.profileRepository.findOne({
      where: {
        type: dto.type,
        chainId: dto.chainId,
        address: dto.address || null,
        slug: dto.slug || null,
      },
    });

    let profile: AssetProfile;
    let version = 1;

    if (existing) {
      // Update existing profile
      profile = existing;
      version = existing.profileVersion + 1;

      // Check if user is owner
      if (
        existing.ownerAddress?.toLowerCase() !==
        dto.attestation.signer.toLowerCase()
      ) {
        throw new ForbiddenException(
          'Only the owner can update this profile',
        );
      }
    } else {
      // Create new profile
      profile = this.profileRepository.create({
        type: dto.type,
        chainId: dto.chainId,
        address: dto.address,
        slug: dto.slug,
        createdBy: userId,
      });
    }

    // Update profile fields
    profile.displayName = dto.display.name;
    profile.symbol = dto.display.symbol;
    profile.shortDescription = dto.display.shortDescription;
    profile.description = dto.display.description;
    profile.logoUrl = dto.media?.logoUrl;
    profile.bannerUrl = dto.media?.bannerUrl;
    profile.themeColor = dto.media?.themeColor;
    profile.website = dto.links?.website;
    profile.docsUrl = dto.links?.docs;
    profile.whitepaperUrl = dto.links?.whitepaper;
    profile.githubUrl = dto.links?.github;
    profile.twitterUrl = dto.links?.twitter;
    profile.discordUrl = dto.links?.discord;
    profile.telegramUrl = dto.links?.telegram;
    profile.tags = dto.tags || [];
    profile.ownerAddress = dto.attestation.signer;
    profile.verifierMethod = dto.attestation.method;
    profile.attestationSignature = dto.attestation.signature;
    profile.trustLevel = TrustLevel.OWNER_VERIFIED;
    profile.profileVersion = version;

    const saved = await this.profileRepository.save(profile);

    // Create version snapshot
    await this.createVersionSnapshot(saved, userId, dto.attestation);

    // Emit event for real-time updates
    this.eventEmitter.emit('metadata.profile.updated', {
      chainId: saved.chainId,
      address: saved.address,
      profileId: saved.id,
      trustLevel: saved.trustLevel,
      version: saved.profileVersion,
    });

    // Clean up challenge
    await this.challengeRepository.remove(challenge);

    return saved;
  }

  /**
   * Get profile by chainId and address
   */
  async getProfile(
    chainId: string,
    address: string,
  ): Promise<AssetProfile | null> {
    return this.profileRepository.findOne({
      where: { chainId, address },
      relations: ['versions', 'attestations'],
      order: { profileVersion: 'DESC' },
    });
  }

  /**
   * Get profile versions
   */
  async getProfileVersions(
    chainId: string,
    address: string,
  ): Promise<AssetProfileVersion[]> {
    const profile = await this.profileRepository.findOne({
      where: { chainId, address },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.versionRepository.find({
      where: { profileId: profile.id },
      order: { version: 'DESC' },
    });
  }

  /**
   * Search profiles
   */
  async searchProfiles(
    query?: string,
    tag?: string,
    trustLevel?: TrustLevel,
    limit: number = 50,
    offset: number = 0,
  ) {
    const qb = this.profileRepository.createQueryBuilder('profile');

    if (query) {
      qb.where(
        '(profile.displayName ILIKE :query OR profile.symbol ILIKE :query OR profile.description ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    if (tag) {
      qb.andWhere(':tag = ANY(profile.tags)', { tag });
    }

    if (trustLevel) {
      qb.andWhere('profile.trustLevel = :trustLevel', { trustLevel });
    }

    qb.andWhere('profile.reviewState = :reviewState', {
      reviewState: ReviewState.CLEAN,
    });

    const [profiles, total] = await qb
      .take(limit)
      .skip(offset)
      .orderBy('profile.updatedAt', 'DESC')
      .getManyAndCount();

    return {
      profiles,
      total,
      limit,
      offset,
    };
  }

  /**
   * Add community attestation
   */
  async addAttestation(
    profileId: string,
    signerAddress: string,
    signature: string,
    rationale?: string,
  ): Promise<CommunityAttestation> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check if already attested
    const existing = await this.attestationRepository.findOne({
      where: { profileId, signerAddress },
    });

    if (existing) {
      throw new BadRequestException('Already attested by this signer');
    }

    // Verify signature (simplified - would verify against profile hash)
    // In production, verify signature against canonical profile hash

    const attestation = this.attestationRepository.create({
      profileId,
      signerAddress,
      signature,
      rationale,
    });

    const saved = await this.attestationRepository.save(attestation);

    // Check if threshold reached (e.g., 3 attestations)
    const count = await this.attestationRepository.count({
      where: { profileId },
    });

    if (count >= 3 && profile.trustLevel === TrustLevel.OWNER_VERIFIED) {
      profile.trustLevel = TrustLevel.COMMUNITY_VERIFIED;
      await this.profileRepository.save(profile);

      this.eventEmitter.emit('metadata.profile.verified', {
        chainId: profile.chainId,
        address: profile.address,
        trustLevel: TrustLevel.COMMUNITY_VERIFIED,
      });
    }

    return saved;
  }

  /**
   * Report profile
   */
  async reportProfile(
    profileId: string,
    reporterId: string,
    reason: string,
  ): Promise<AssetReport> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const report = this.reportRepository.create({
      profileId,
      reporterId,
      reason,
    });

    const saved = await this.reportRepository.save(report);

    // Auto-shadow if high-risk keywords detected
    const highRiskKeywords = ['phishing', 'scam', 'fraud', 'fake'];
    const lowerReason = reason.toLowerCase();
    if (highRiskKeywords.some((keyword) => lowerReason.includes(keyword))) {
      profile.reviewState = ReviewState.SHADOW;
      await this.profileRepository.save(profile);
    }

    return saved;
  }

  /**
   * Verify signature (EIP-191 or EIP-1271)
   */
  private async verifySignature(
    address: string,
    message: string,
    signature: string,
    method: AttestationMethod,
  ): Promise<boolean> {
    try {
      if (method === AttestationMethod.EIP191) {
        // EIP-191: Standard message signing
        const recovered = ethers.verifyMessage(message, signature);
        return recovered.toLowerCase() === address.toLowerCase();
      } else if (method === AttestationMethod.EIP1271) {
        // EIP-1271: Contract signature verification
        // Would need to call isValidSignature on contract
        // For now, simplified check
        this.logger.warn('EIP-1271 verification not fully implemented');
        return true;
      } else {
        throw new BadRequestException(`Unsupported verification method: ${method}`);
      }
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      throw new BadRequestException('Invalid signature');
    }
  }

  /**
   * Create version snapshot
   */
  private async createVersionSnapshot(
    profile: AssetProfile,
    userId: string,
    attestation: any,
  ): Promise<void> {
    const snapshot = {
      displayName: profile.displayName,
      symbol: profile.symbol,
      shortDescription: profile.shortDescription,
      description: profile.description,
      logoUrl: profile.logoUrl,
      bannerUrl: profile.bannerUrl,
      themeColor: profile.themeColor,
      website: profile.website,
      docsUrl: profile.docsUrl,
      whitepaperUrl: profile.whitepaperUrl,
      githubUrl: profile.githubUrl,
      twitterUrl: profile.twitterUrl,
      discordUrl: profile.discordUrl,
      telegramUrl: profile.telegramUrl,
      tags: profile.tags,
    };

    const version = this.versionRepository.create({
      profileId: profile.id,
      version: profile.profileVersion,
      data: snapshot,
      attestation: {
        method: attestation.method,
        signer: attestation.signer,
        signature: attestation.signature,
        challengeId: attestation.challengeId,
      },
      createdBy: userId,
    });

    await this.versionRepository.save(version);
  }
}

