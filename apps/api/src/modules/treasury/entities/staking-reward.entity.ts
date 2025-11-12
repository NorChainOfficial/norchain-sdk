import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RewardType {
  VALIDATOR_STAKING = 'validator_staking',
  DELEGATOR_STAKING = 'delegator_staking',
  LIQUIDITY_PROVIDER = 'liquidity_provider',
  GOVERNANCE_PARTICIPATION = 'governance_participation',
}

export enum RewardStatus {
  PENDING = 'pending',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
}

@Entity('staking_rewards')
@Index(['validatorAddress', 'period'])
@Index(['delegatorAddress', 'period'])
@Index(['status', 'claimableUntil'])
export class StakingReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 42, nullable: true, name: 'validator_address' })
  validatorAddress?: string; // Validator wallet address

  @Column({ type: 'varchar', length: 42, nullable: true, name: 'delegator_address' })
  delegatorAddress?: string; // Delegator wallet address

  @Column({ type: 'varchar', length: 20 })
  period: string; // e.g., "2025-01"

  @Column({
    type: 'enum',
    enum: RewardType,
  })
  type: RewardType;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string; // Reward amount in NOR

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true, name: 'staked_amount' })
  stakedAmount?: string; // Amount staked (for calculating APY)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'apy' })
  apy?: number; // Annual Percentage Yield

  @Column({
    type: 'enum',
    enum: RewardStatus,
    default: RewardStatus.PENDING,
  })
  status: RewardStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'claimable_until' })
  claimableUntil?: Date; // Expiration date for claiming

  @Column({ type: 'varchar', length: 66, nullable: true, name: 'claim_tx_hash' })
  claimTxHash?: string; // Transaction hash when claimed

  @Column({ type: 'bigint', nullable: true, name: 'claim_block_no' })
  claimBlockNo?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional reward data (uptime, compliance score, etc.)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

