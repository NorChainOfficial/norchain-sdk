import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AssetProfile } from './asset-profile.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('asset_profile_versions')
@Index(['profileId', 'version'], { unique: true })
export class AssetProfileVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => AssetProfile, (profile) => profile.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: AssetProfile;

  @Column()
  version: number;

  @Column('jsonb')
  data: Record<string, any>; // Full profile snapshot

  @Column('jsonb', { nullable: true })
  attestation: {
    method: string;
    signer: string;
    signature: string;
    challengeId?: string;
  } | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}
