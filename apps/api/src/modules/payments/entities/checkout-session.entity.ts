import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CheckoutSessionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('checkout_sessions')
@Index(['merchantId'])
@Index(['status'])
@Index(['sessionId'], { unique: true })
export class CheckoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'session_id' })
  sessionId: string; // e.g., "cs_01J..."

  @Column({ type: 'uuid', name: 'merchant_id' })
  merchantId: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ type: 'varchar', length: 10, default: 'NOR' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  assets?: string[]; // Supported assets: ["NOR", "USDT", ...]

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // e.g., { orderId: "ORD-7788" }

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'success_url' })
  successUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cancel_url' })
  cancelUrl?: string;

  @Column({
    type: 'enum',
    enum: CheckoutSessionStatus,
    default: CheckoutSessionStatus.PENDING,
  })
  status: CheckoutSessionStatus;

  @Column({
    type: 'varchar',
    length: 66,
    nullable: true,
    name: 'payment_tx_hash',
  })
  paymentTxHash?: string; // On-chain transaction hash

  @Column({
    type: 'varchar',
    length: 42,
    nullable: true,
    name: 'payer_address',
  })
  payerAddress?: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'paid_at' })
  paidAt?: Date;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
