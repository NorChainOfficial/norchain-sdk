import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SettlementType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  MANUAL = 'manual',
}

@Entity('merchant_settlements')
export class MerchantSettlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'merchantId' })
  merchant: User;

  @Column({ type: 'enum', enum: SettlementType })
  type: SettlementType;

  @Column({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.PENDING })
  status: SettlementStatus;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  totalAmount: string;

  @Column()
  currency: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  fees: string; // Settlement fees

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  netAmount: string; // Amount after fees

  @Column({ type: 'jsonb' })
  transactions: string[]; // Array of invoice/session IDs included in settlement

  @Column({ nullable: true })
  settlementAddress: string; // Address where funds are sent

  @Column({ type: 'text', nullable: true })
  settlementTxHash: string;

  @Column({ type: 'timestamp' })
  periodStart: Date;

  @Column({ type: 'timestamp' })
  periodEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

