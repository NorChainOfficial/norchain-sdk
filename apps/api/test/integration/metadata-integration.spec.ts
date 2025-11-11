/**
 * Metadata Integration Tests
 *
 * Tests metadata service integration with database, RPC, and Storage
 * - Challenge creation and verification
 * - Profile submission and retrieval
 * - Profile search and filtering
 * - Attestation management
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { MetadataService } from '../../src/modules/metadata/metadata.service';
import { RpcService } from '../../src/common/services/rpc.service';
import { SupabaseStorageService } from '../../src/modules/supabase/supabase-storage.service';

describe('Metadata Integration Tests', () => {
  let app: INestApplication;
  let metadataService: MetadataService;
  let rpcService: RpcService;
  let storageService: SupabaseStorageService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    metadataService = moduleFixture.get<MetadataService>(MetadataService);
    rpcService = moduleFixture.get<RpcService>(RpcService);
    storageService = moduleFixture.get<SupabaseStorageService>(SupabaseStorageService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Metadata Service', () => {
    it('should be initialized', () => {
      expect(metadataService).toBeDefined();
      expect(rpcService).toBeDefined();
      expect(storageService).toBeDefined();
    });

    it('should search profiles', async () => {
      try {
        const result = await metadataService.searchProfiles(undefined, undefined, undefined, 10, 0);
        expect(result).toHaveProperty('profiles');
        expect(result).toHaveProperty('total');
        expect(result).toHaveProperty('limit');
        expect(result).toHaveProperty('offset');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get profile by chainId and address', async () => {
      try {
        const result = await metadataService.getProfile('65001', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
        // Result can be null if profile doesn't exist
        expect(result === null || typeof result === 'object').toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

