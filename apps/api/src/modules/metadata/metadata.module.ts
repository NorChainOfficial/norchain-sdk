import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { AssetProfile } from './entities/asset-profile.entity';
import { AssetProfileVersion } from './entities/asset-profile-version.entity';
import { OwnershipChallenge } from './entities/ownership-challenge.entity';
import { CommunityAttestation } from './entities/community-attestation.entity';
import { AssetReport } from './entities/asset-report.entity';
import { CommonModule } from '@/common/common.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SupabaseModule } from '../supabase/supabase.module';
import { MetadataStorageService } from './metadata-storage.service';
import { IPFSService } from './ipfs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetProfile,
      AssetProfileVersion,
      OwnershipChallenge,
      CommunityAttestation,
      AssetReport,
    ]),
    CommonModule,
    EventEmitterModule,
    SupabaseModule,
  ],
  controllers: [MetadataController],
  providers: [MetadataService, MetadataStorageService, IPFSService],
  exports: [MetadataService, MetadataStorageService, IPFSService],
})
export class MetadataModule {}
