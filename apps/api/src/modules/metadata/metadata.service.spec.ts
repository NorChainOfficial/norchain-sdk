import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetadataService } from './metadata.service';
import { AssetProfile, AssetType, TrustLevel, AttestationMethod, ReviewState } from './entities/asset-profile.entity';
import { OwnershipChallenge } from './entities/ownership-challenge.entity';
import { AssetProfileVersion } from './entities/asset-profile-version.entity';
import { CommunityAttestation } from './entities/community-attestation.entity';
import { AssetReport } from './entities/asset-report.entity';
import { RpcService } from '@/common/services/rpc.service';
import { SupabaseStorageService } from '../supabase/supabase-storage.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitProfileDto } from './dto/submit-profile.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

describe('MetadataService', () => {
  let service: MetadataService;
  let profileRepository: Repository<AssetProfile>;
  let challengeRepository: Repository<OwnershipChallenge>;
  let rpcService: RpcService;

  const mockProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockChallengeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockVersionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockAttestationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockReportRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRpcService = {
    getProvider: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    getSignedUrl: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataService,
        {
          provide: getRepositoryToken(AssetProfile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(OwnershipChallenge),
          useValue: mockChallengeRepository,
        },
        {
          provide: getRepositoryToken(AssetProfileVersion),
          useValue: mockVersionRepository,
        },
        {
          provide: getRepositoryToken(CommunityAttestation),
          useValue: mockAttestationRepository,
        },
        {
          provide: getRepositoryToken(AssetReport),
          useValue: mockReportRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockStorageService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<MetadataService>(MetadataService);
    profileRepository = module.get<Repository<AssetProfile>>(
      getRepositoryToken(AssetProfile),
    );
    challengeRepository = module.get<Repository<OwnershipChallenge>>(
      getRepositoryToken(OwnershipChallenge),
    );
    rpcService = module.get<RpcService>(RpcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createChallenge', () => {
    it('should create an ownership challenge', async () => {
      const dto: CreateChallengeDto = {
        chainId: '65001',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockChallenge = {
        id: 'challenge-123',
        ...dto,
        message: 'Test message',
        nonce: 'nonce123',
        expiresAt: new Date(Date.now() + 600000),
        createdAt: new Date(),
      };

      mockChallengeRepository.create.mockReturnValue(mockChallenge);
      mockChallengeRepository.save.mockResolvedValue(mockChallenge);

      const result = await service.createChallenge('user-123', dto);

      expect(result).toHaveProperty('challengeId');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('expiresAt');
      expect(mockChallengeRepository.save).toHaveBeenCalled();
    });
  });

  describe('submitProfile', () => {
    it('should submit a profile with valid signature', async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = 'Test message';
      const signature = await wallet.signMessage(message);
      
      const dto: SubmitProfileDto = {
        type: AssetType.TOKEN,
        chainId: '65001',
        address: wallet.address.toLowerCase(),
        display: {
          name: 'Test Token',
          symbol: 'TEST',
          shortDescription: 'Test',
          description: 'Test description',
        },
        attestation: {
          method: AttestationMethod.EIP191,
          signer: wallet.address.toLowerCase(),
          signature,
          challengeId: 'challenge-123',
        },
      };

      const mockChallenge = {
        id: 'challenge-123',
        address: wallet.address.toLowerCase(),
        message,
        expiresAt: new Date(Date.now() + 600000),
      };

      const mockProfile = {
        id: 'profile-123',
        ...dto,
        trustLevel: TrustLevel.OWNER_VERIFIED,
        createdAt: new Date(),
      };

      mockChallengeRepository.findOne.mockResolvedValue(mockChallenge);
      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue(mockProfile);
      mockProfileRepository.save.mockResolvedValue(mockProfile);
      mockVersionRepository.create.mockReturnValue({});
      mockVersionRepository.save.mockResolvedValue({});
      mockChallengeRepository.remove.mockResolvedValue(undefined);

      const result = await service.submitProfile('user-123', dto);

      expect(result).toHaveProperty('id');
      expect(mockProfileRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if challenge not found', async () => {
      const dto: SubmitProfileDto = {
        type: AssetType.TOKEN,
        chainId: '65001',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        display: {
          name: 'Test Token',
          symbol: 'TEST',
        },
        attestation: {
          method: AttestationMethod.EIP191,
          signer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          signature: '0x',
          challengeId: 'invalid-id',
        },
      };

      mockChallengeRepository.findOne.mockResolvedValue(null);

      await expect(service.submitProfile('user-123', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if challenge expired', async () => {
      const dto: SubmitProfileDto = {
        type: AssetType.TOKEN,
        chainId: '65001',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        display: {
          name: 'Test Token',
          symbol: 'TEST',
        },
        attestation: {
          method: AttestationMethod.EIP191,
          signer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          signature: '0x',
          challengeId: 'challenge-123',
        },
      };

      const mockChallenge = {
        id: 'challenge-123',
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      mockChallengeRepository.findOne.mockResolvedValue(mockChallenge);

      await expect(service.submitProfile('user-123', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return asset profile', async () => {
      const chainId = '65001';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockProfile = {
        id: 'profile-123',
        chainId,
        address,
        type: AssetType.TOKEN,
        trustLevel: TrustLevel.OWNER_VERIFIED,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile(chainId, address);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('chainId', chainId);
    });

    it('should return null if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.getProfile(
        '65001',
        '0x0000000000000000000000000000000000000000',
      );

      expect(result).toBeNull();
    });
  });

  describe('getProfileVersions', () => {
    it('should return profile versions', async () => {
      const chainId = '65001';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockProfile = {
        id: 'profile-123',
        chainId,
        address,
      };

      const mockVersions = [
        {
          id: 'version-1',
          profileId: 'profile-123',
          version: 1,
        },
      ];

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockVersionRepository.find.mockResolvedValue(mockVersions);

      const result = await service.getProfileVersions(chainId, address);

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getProfileVersions(
          '65001',
          '0x0000000000000000000000000000000000000000',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reportProfile', () => {
    it('should create an asset report', async () => {
      const profileId = 'profile-123';
      const reason = 'spam';

      const mockProfile = {
        id: profileId,
        chainId: '65001',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        reviewState: ReviewState.CLEAN,
      };

      const mockReport = {
        id: 'report-123',
        profileId,
        reporterId: 'user-123',
        reason,
        createdAt: new Date(),
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockReportRepository.create.mockReturnValue(mockReport);
      mockReportRepository.save.mockResolvedValue(mockReport);
      mockProfileRepository.save.mockResolvedValue(mockProfile);

      const result = await service.reportProfile(profileId, 'user-123', reason);

      expect(result).toBeDefined();
      expect(mockReportRepository.save).toHaveBeenCalled();
    });

    it('should auto-shadow profile with high-risk keywords', async () => {
      const profileId = 'profile-123';
      const reason = 'This is a phishing scam';

      const mockProfile = {
        id: profileId,
        chainId: '65001',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        reviewState: ReviewState.CLEAN,
      };

      const mockReport = {
        id: 'report-123',
        profileId,
        reporterId: 'user-123',
        reason,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockReportRepository.create.mockReturnValue(mockReport);
      mockReportRepository.save.mockResolvedValue(mockReport);
      mockProfileRepository.save.mockResolvedValue({
        ...mockProfile,
        reviewState: ReviewState.SHADOWED,
      });

      await service.reportProfile(profileId, 'user-123', reason);

      expect(mockProfileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewState: ReviewState.SHADOWED,
        }),
      );
    });
  });

  describe('searchProfiles', () => {
    it('should search profiles by query', async () => {
      const query = 'test token';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockProfileRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchProfiles(query);

      expect(result).toHaveProperty('profiles');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('offset');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should filter by tag', async () => {
      const tag = 'defi';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockProfileRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.searchProfiles(undefined, tag);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        ':tag = ANY(profile.tags)',
        { tag },
      );
    });

    it('should filter by trust level', async () => {
      const trustLevel = TrustLevel.OWNER_VERIFIED;
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockProfileRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.searchProfiles(undefined, undefined, trustLevel);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'profile.trustLevel = :trustLevel',
        { trustLevel },
      );
    });

    it('should use default limit and offset', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockProfileRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchProfiles();

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });
  });

  describe('addAttestation', () => {
    it('should add community attestation', async () => {
      const profileId = 'profile-123';
      const signerAddress = '0x1234567890123456789012345678901234567890';
      const signature = '0xsignature';

      const mockProfile = {
        id: profileId,
        chainId: '65001',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        trustLevel: TrustLevel.OWNER_VERIFIED,
      };

      const mockAttestation = {
        id: 'attestation-123',
        profileId,
        signerAddress,
        signature,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockAttestationRepository.findOne.mockResolvedValue(null);
      mockAttestationRepository.create.mockReturnValue(mockAttestation);
      mockAttestationRepository.save.mockResolvedValue(mockAttestation);
      mockAttestationRepository.count.mockResolvedValue(2);

      const result = await service.addAttestation(
        profileId,
        signerAddress,
        signature,
      );

      expect(result).toBeDefined();
      expect(mockAttestationRepository.save).toHaveBeenCalled();
    });

    it('should upgrade to community verified when threshold reached', async () => {
      const profileId = 'profile-123';
      const signerAddress = '0x1234567890123456789012345678901234567890';
      const signature = '0xsignature';

      const mockProfile = {
        id: profileId,
        chainId: '65001',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        trustLevel: TrustLevel.OWNER_VERIFIED,
      };

      const mockAttestation = {
        id: 'attestation-123',
        profileId,
        signerAddress,
        signature,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockAttestationRepository.findOne.mockResolvedValue(null);
      mockAttestationRepository.create.mockReturnValue(mockAttestation);
      mockAttestationRepository.save.mockResolvedValue(mockAttestation);
      mockAttestationRepository.count.mockResolvedValue(3);
      mockProfileRepository.save.mockResolvedValue({
        ...mockProfile,
        trustLevel: TrustLevel.COMMUNITY_VERIFIED,
      });

      await service.addAttestation(profileId, signerAddress, signature);

      expect(mockProfileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          trustLevel: TrustLevel.COMMUNITY_VERIFIED,
        }),
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addAttestation('invalid-id', '0x123', '0xsig'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already attested', async () => {
      const profileId = 'profile-123';
      const signerAddress = '0x1234567890123456789012345678901234567890';

      const mockProfile = {
        id: profileId,
        chainId: '65001',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const existingAttestation = {
        id: 'existing-123',
        profileId,
        signerAddress,
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockAttestationRepository.findOne.mockResolvedValue(existingAttestation);

      await expect(
        service.addAttestation(profileId, signerAddress, '0xsig'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

