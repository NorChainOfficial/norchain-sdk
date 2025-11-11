import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
@Index(['merchantId'])
@Index(['checkoutSessionId'])
@Index(['status'])
@Index(['txHash'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'payment_id' })
  paymentId: string; // e.g., "pay_01J..."

  @Column({ type: 'uuid', name: 'merchant_id' })
  merchantId: string;

  @Column({ type: 'uuid', nullable: true, name: 'checkout_session_id' })
  checkoutSessionId?: string;

  @Column({ type: 'uuid', nullable: true, name: 'invoice_id' })
  invoiceId?: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ type: 'varchar', length: 10, default: 'NOR' })
  currency: string;

  @Column({ type: 'varchar', length: 42, name: 'payer_address' })
  payerAddress: string;

  @Column({
    type: 'varchar',
    length: 42,
    nullable: true,
    name: 'recipient_address',
  })
  recipientAddress?: string;

  @Column({ type: 'varchar', length: 66, nullable: true, name: 'tx_hash' })
  txHash?: string; // On-chain transaction hash

  @Column({ type: 'bigint', nullable: true, name: 'block_no' })
  blockNo?: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

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
