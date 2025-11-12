import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DistributionType {
  VALIDATOR_REWARDS = 'validator_rewards',
  DEVELOPER_GRANTS = 'developer_grants',
  AI_FUND = 'ai_fund',
  CHARITY_ESG = 'charity_esg',
  TREASURY_RESERVE = 'treasury_reserve',
}

export enum DistributionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('revenue_distributions')
@Index(['period', 'type'])
@Index(['status', 'createdAt'])
export class RevenueDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  period: string; // e.g., "2025-01"

  @Column({
    type: 'enum',
    enum: DistributionType,
  })
  type: DistributionType;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string; // Amount in NOR

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number; // Percentage of total revenue (e.g., 25.00 for 25%)

  @Column({
    type: 'enum',
    enum: DistributionStatus,
    default: DistributionStatus.PENDING,
  })
  status: DistributionStatus;

  @Column({ type: 'varchar', length: 66, nullable: true, name: 'tx_hash' })
  txHash?: string; // On-chain transaction hash

  @Column({ type: 'bigint', nullable: true, name: 'block_no' })
  blockNo?: number;

  @Column({ type: 'jsonb', nullable: true })
  recipients?: Array<{
    address: string;
    amount: string;
    share: number; // Percentage share of this distribution
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

