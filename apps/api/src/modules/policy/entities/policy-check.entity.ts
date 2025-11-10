import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum PolicyCheckStatus {
  ALLOWED = 'allowed',
  BLOCKED = 'blocked',
  PENDING_REVIEW = 'pending_review',
}

export enum PolicyCheckType {
  SANCTIONS = 'sanctions',
  KYC_TIER = 'kyc_tier',
  GEO_FENCE = 'geo_fence',
  VELOCITY = 'velocity',
  RWA_CAP = 'rwa_cap',
  AML_HEURISTIC = 'aml_heuristic',
  COMPLIANCE_SCORE = 'compliance_score',
}

@Entity('policy_checks')
@Index(['requestId', 'createdAt'])
@Index(['userId', 'status'])
export class PolicyCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string; // Unique request identifier (can be idempotency key or tx hash)

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'enum', enum: PolicyCheckType })
  checkType: PolicyCheckType;

  @Column({ type: 'enum', enum: PolicyCheckStatus })
  status: PolicyCheckStatus;

  @Column({ type: 'text', nullable: true })
  fromAddress: string;

  @Column({ type: 'text', nullable: true })
  toAddress: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  amount: string;

  @Column({ nullable: true })
  asset: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    reason?: string;
    matchedLists?: string[];
    kycTier?: string;
    velocityData?: {
      dailyTxCount?: number;
      dailyValue?: string;
      limit?: string;
    };
    geoData?: {
      country?: string;
      ipAddress?: string;
      blocked?: boolean;
    };
    complianceScore?: number;
    riskFlags?: string[];
  };

  @Column({ type: 'text', nullable: true })
  auditHash: string; // Merkle hash for L1 anchoring

  @Column({ type: 'text', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}

