import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  WON = 'won',
  LOST = 'lost',
  WARNING_CLOSED = 'warning_closed',
}

@Entity('disputes')
@Index(['paymentId'])
@Index(['merchantId'])
@Index(['status'])
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'payment_id' })
  paymentId: string;

  @Column({ type: 'uuid', name: 'merchant_id' })
  merchantId: string;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.OPEN,
  })
  status: DisputeStatus;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'jsonb', nullable: true, name: 'merchant_evidence' })
  merchantEvidence?: Record<string, any>; // Evidence uploads

  @Column({ type: 'jsonb', nullable: true, name: 'customer_evidence' })
  customerEvidence?: Record<string, any>;

  @Column({ type: 'varchar', length: 66, nullable: true, name: 'escrow_tx' })
  escrowTx?: string; // On-chain escrow transaction

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
