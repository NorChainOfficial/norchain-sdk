import { Test, TestingModule } from '@nestjs/testing';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { MetadataStorageService } from './metadata-storage.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitProfileDto } from './dto/submit-profile.dto';
import { AssetType, AttestationMethod } from './entities/asset-profile.entity';

describe('MetadataController', () => {
  let controller: MetadataController;
  let metadataService: MetadataService;

  const mockMetadataService = {
    createChallenge: jest.fn(),
    submitProfile: jest.fn(),
    getProfile: jest.fn(),
    getProfileVersions: jest.fn(),
    reportProfile: jest.fn(),
    searchProfiles: jest.fn(),
    addAttestation: jest.fn(),
  };

  const mockStorageService = {
    uploadMedia: jest.fn(),
    getMediaUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetadataController],
      providers: [
        {
          provide: MetadataService,
          useValue: mockMetadataService,
        },
        {
          provide: MetadataStorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = module.get<MetadataController>(MetadataController);
    metadataService = module.get<MetadataService>(MetadataService);
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

      const mockResult = {
        challengeId: 'challenge-123',
        message: 'Test message',
        expiresAt: new Date(),
      };

      mockMetadataService.createChallenge.mockResolvedValue(mockResult);

      const result = await controller.createChallenge(
        { user: { id: 'user-123' } },
        dto,
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('submitProfile', () => {
    it('should submit an asset profile', async () => {
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

      const mockResult = {
        profileId: 'profile-123',
        trustLevel: 'owner_verified',
      };

      mockMetadataService.submitProfile.mockResolvedValue(mockResult);

      const result = await controller.submitProfile(
        { user: { id: 'user-123' } },
        dto,
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('getAssetProfile', () => {
    it('should return asset profile', async () => {
      const chainId = '65001';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockProfile = {
        id: 'profile-123',
        chainId,
        address,
      };

      mockMetadataService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(chainId, address);

      expect(result).toEqual(mockProfile);
    });
  });

  describe('getAssetProfileVersions', () => {
    it('should return profile versions', async () => {
      const chainId = '65001';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockVersions = [{ version: 1 }];

      mockMetadataService.getProfileVersions.mockResolvedValue(mockVersions);

      const result = await controller.getProfileVersions(chainId, address);

      expect(result).toEqual(mockVersions);
    });
  });

  describe('reportProfile', () => {
    it('should create an asset report', async () => {
      const dto = {
        profileId: 'profile-123',
        reason: 'spam',
      };

      const mockResult = {
        id: 'report-123',
      };

      mockMetadataService.reportProfile.mockResolvedValue(mockResult);

      const result = await controller.reportProfile(
        { user: { id: 'user-123' } },
        dto,
      );

      expect(result).toEqual(mockResult);
    });
  });
});

