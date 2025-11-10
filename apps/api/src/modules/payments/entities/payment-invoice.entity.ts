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

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CRYPTO = 'crypto',
  FIAT = 'fiat',
  HYBRID = 'hybrid',
}

@Entity('payment_invoices')
export class PaymentInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  invoiceNumber: string; // Unique invoice number

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column()
  currency: string; // NOR, USD, NOK, AED, etc.

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CRYPTO })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  recipientAddress: string; // Crypto address for payment

  @Column({ nullable: true })
  fiatAccount: string; // Bank account or payment processor ID

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'text', nullable: true })
  paymentTxHash: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    customerName?: string;
    customerEmail?: string;
    items?: Array<{
      description: string;
      quantity: number;
      price: string;
    }>;
    tax?: string;
    discount?: string;
  };

  @Column({ nullable: true })
  qrCode: string; // QR code data for payment

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
