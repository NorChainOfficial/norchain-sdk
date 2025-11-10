import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { AssetProfileVersion } from './asset-profile-version.entity';
import { CommunityAttestation } from './community-attestation.entity';

export enum AssetType {
  TOKEN = 'token',
  CONTRACT = 'contract',
  PROJECT = 'project',
}

export enum TrustLevel {
  UNVERIFIED = 'unverified',
  OWNER_VERIFIED = 'owner_verified',
  COMMUNITY_VERIFIED = 'community_verified',
  NOR_VERIFIED = 'nor_verified',
}

export enum ReviewState {
  CLEAN = 'clean',
  FLAGGED = 'flagged',
  SHADOW = 'shadow',
}

export enum AttestationMethod {
  EIP191 = 'eip191',
  EIP1271 = 'eip1271',
  DNS = 'dns',
  ENS = 'ens',
  VERIFIER_ADDRESS = 'verifierAddress',
}

@Entity('asset_profiles')
@Index(['type', 'chainId', 'address'], { unique: true })
@Index(['trustLevel', 'reviewState'])
@Index(['chainId', 'address'])
export class AssetProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType;

  @Column()
  chainId: string;

  @Column({ nullable: true })
  address: string; // Nullable for projects

  @Column({ nullable: true })
  slug: string; // For projects

  // Display fields
  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  symbol: string;

  @Column({ type: 'text', nullable: true, length: 160 })
  shortDescription: string;

  @Column({ type: 'text', nullable: true, length: 4096 })
  description: string;

  @Column({ nullable: true })
  themeColor: string; // Hex color

  // Media
  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  // Links
  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  docsUrl: string;

  @Column({ nullable: true })
  whitepaperUrl: string;

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  twitterUrl: string;

  @Column({ nullable: true })
  discordUrl: string;

  @Column({ nullable: true })
  telegramUrl: string;

  // Tags
  @Column('simple-array', { default: [] })
  tags: string[];

  // Trust & Review
  @Column({ type: 'enum', enum: TrustLevel, default: TrustLevel.UNVERIFIED })
  trustLevel: TrustLevel;

  @Column({ type: 'enum', enum: ReviewState, default: ReviewState.CLEAN })
  reviewState: ReviewState;

  @Column({ default: 1 })
  profileVersion: number;

  // Ownership & Attestation
  @Column({ nullable: true })
  ownerAddress: string; // EOA/contract that proved ownership

  @Column({ type: 'enum', enum: AttestationMethod, nullable: true })
  verifierMethod: AttestationMethod;

  @Column({ type: 'text', nullable: true })
  attestationSignature: string; // Hex signature

  // Relations
  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @OneToMany(() => AssetProfileVersion, (version) => version.profile)
  versions: AssetProfileVersion[];

  @OneToMany(() => CommunityAttestation, (attestation) => attestation.profile)
  attestations: CommunityAttestation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

