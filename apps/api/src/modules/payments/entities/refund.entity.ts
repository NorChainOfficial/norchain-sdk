import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

@Entity('refunds')
@Index(['paymentId'])
@Index(['merchantId'])
@Index(['status'])
@Index(['txHash'])
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'refund_id' })
  refundId: string; // e.g., "ref_01J..."

  @Column({ type: 'uuid', name: 'payment_id' })
  paymentId: string;

  @Column({ type: 'uuid', name: 'merchant_id' })
  merchantId: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ type: 'varchar', length: 10, default: 'NOR' })
  currency: string;

  @Column({ type: 'varchar', length: 42, name: 'recipient_address' })
  recipientAddress: string; // Address to refund to

  @Column({ type: 'varchar', length: 66, nullable: true, name: 'tx_hash' })
  txHash?: string; // On-chain transaction hash

  @Column({ type: 'bigint', nullable: true, name: 'block_no' })
  blockNo?: number;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'uuid', nullable: true, name: 'journal_entry_id' })
  journalEntryId?: string; // Linked to ledger journal entry

  @Column({ type: 'timestamptz', nullable: true, name: 'confirmed_at' })
  confirmedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

