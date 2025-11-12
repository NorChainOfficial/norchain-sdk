import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BillingPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  MONTHLY = 'monthly',
}

export enum BillingStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity('usage_billing')
@Index(['userId', 'period', 'periodStart'])
@Index(['status', 'periodStart'])
export class UsageBilling {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: BillingPeriod,
    default: BillingPeriod.MONTHLY,
  })
  period: BillingPeriod;

  @Column({ type: 'timestamp', name: 'period_start' })
  periodStart: Date;

  @Column({ type: 'timestamp', name: 'period_end' })
  periodEnd: Date;

  @Column({ type: 'int', default: 0 })
  totalCalls: number;

  @Column({ type: 'int', default: 0 })
  totalRpcCalls: number;

  @Column({ type: 'int', default: 0 })
  totalStreamingMinutes: number;

  @Column({ type: 'int', default: 0 })
  totalWebhookDeliveries: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: '0' })
  totalCost: string; // Total cost in NOR

  @Column({ type: 'decimal', precision: 10, scale: 6, default: '0' })
  baseCost: string; // Base subscription cost

  @Column({ type: 'decimal', precision: 10, scale: 6, default: '0' })
  usageCost: string; // Usage-based cost

  @Column({
    type: 'enum',
    enum: BillingStatus,
    default: BillingStatus.PENDING,
  })
  status: BillingStatus;

  @Column({ type: 'uuid', nullable: true, name: 'invoice_id' })
  invoiceId?: string; // Link to payment invoice

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentTxHash?: string; // On-chain payment transaction hash

  @Column({ type: 'jsonb', nullable: true })
  breakdown?: Record<string, any>; // Detailed cost breakdown

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

