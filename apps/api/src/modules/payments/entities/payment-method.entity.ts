import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

export enum PaymentMethodKind {
  CUSTODIAL = 'custodial', // Managed wallet
  EXTERNAL = 'external', // External wallet address
  BANK = 'bank', // Bank account (for fiat)
}

@Entity('payment_methods')
@Index(['customerId'])
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.paymentMethods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: PaymentMethodKind,
  })
  kind: PaymentMethodKind;

  @Column({ type: 'text', name: 'details_enc' })
  detailsEnc: string; // Encrypted payment details

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

