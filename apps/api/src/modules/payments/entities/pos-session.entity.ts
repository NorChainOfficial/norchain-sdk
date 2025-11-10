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

export enum POSSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('pos_sessions')
export class POSSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'merchantId' })
  merchant: User;

  @Column()
  sessionToken: string; // Unique token for POS session

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: POSSessionStatus, default: POSSessionStatus.ACTIVE })
  status: POSSessionStatus;

  @Column({ nullable: true })
  qrCode: string; // QR code for customer scanning

  @Column({ nullable: true })
  paymentAddress: string; // Address to receive payment

  @Column({ type: 'text', nullable: true })
  paymentTxHash: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    description?: string;
    customerInfo?: {
      name?: string;
      email?: string;
    };
    location?: {
      lat?: number;
      lng?: number;
      address?: string;
    };
  };

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

