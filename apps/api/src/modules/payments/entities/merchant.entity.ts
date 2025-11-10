import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum KYCTier {
  TIER_0 = 'tier_0', // No KYC
  TIER_1 = 'tier_1', // Basic KYC
  TIER_2 = 'tier_2', // Enhanced KYC
  TIER_3 = 'tier_3', // Full KYC
}

export enum SettlementPreference {
  CRYPTO_ONLY = 'crypto_only',
  CRYPTO_AND_FIAT = 'crypto_and_fiat',
}

@Entity('merchants')
@Index(['orgId'], { unique: true })
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'org_id', unique: true })
  orgId: string;

  @Column({
    type: 'enum',
    enum: KYCTier,
    default: KYCTier.TIER_0,
    name: 'kyc_tier',
  })
  kycTier: KYCTier;

  @Column({
    type: 'enum',
    enum: SettlementPreference,
    default: SettlementPreference.CRYPTO_ONLY,
    name: 'settlement_prefs',
  })
  settlementPreference: SettlementPreference;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'webhook_secret' })
  webhookSecret?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'webhook_url' })
  webhookUrl?: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

