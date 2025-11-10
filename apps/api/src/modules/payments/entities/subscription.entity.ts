import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
}

export enum ProrationPolicy {
  NONE = 'none',
  CREATE_PRORATION = 'create_proration',
  ALWAYS_INVOICE = 'always_invoice',
}

@Entity('subscriptions')
@Index(['customerId'])
@Index(['priceId'])
@Index(['status'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'price_id' })
  priceId: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIALING,
  })
  status: SubscriptionStatus;

  @Column({ type: 'timestamptz', nullable: true, name: 'current_period_start' })
  currentPeriodStart?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'current_period_end' })
  currentPeriodEnd?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'next_billing_at' })
  nextBillingAt?: Date;

  @Column({
    type: 'enum',
    enum: ProrationPolicy,
    default: ProrationPolicy.CREATE_PRORATION,
    name: 'proration_policy',
  })
  prorationPolicy: ProrationPolicy;

  @Column({ type: 'timestamptz', nullable: true, name: 'canceled_at' })
  canceledAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

