import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('coupons')
@Index(['code', 'orgId'], { unique: true })
@Index(['orgId'])
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'org_id' })
  orgId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CouponType,
    default: CouponType.PERCENTAGE,
  })
  type: CouponType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'discount_value',
  })
  discountValue: string; // Percentage (0-100) or fixed amount in NOR

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus;

  @Column({ type: 'int', nullable: true, name: 'max_redemptions' })
  maxRedemptions?: number; // null = unlimited

  @Column({ type: 'int', default: 0, name: 'times_redeemed' })
  timesRedeemed: number;

  @Column({ type: 'timestamp', nullable: true, name: 'valid_from' })
  validFrom?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'valid_until' })
  validUntil?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'minimum_amount' })
  minimumAmount?: string; // Minimum purchase amount in NOR

  @Column({ type: 'boolean', default: false, name: 'applies_to_subscriptions' })
  appliesToSubscriptions: boolean;

  @Column({ type: 'boolean', default: false, name: 'applies_to_products' })
  appliesToProducts: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

