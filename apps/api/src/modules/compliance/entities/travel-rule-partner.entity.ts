import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PartnerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum PartnerType {
  VASP = 'vasp', // Virtual Asset Service Provider
  BANK = 'bank',
  EXCHANGE = 'exchange',
  WALLET_PROVIDER = 'wallet_provider',
  OTHER = 'other',
}

@Entity('travel_rule_partners')
@Index(['status', 'type'])
@Index(['jurisdiction'])
@Index(['apiEndpoint'])
export class TravelRulePartner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Partner name

  @Column({
    type: 'enum',
    enum: PartnerType,
  })
  type: PartnerType;

  @Column({ type: 'varchar', length: 10, nullable: true })
  jurisdiction?: string; // ISO country code

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'api_endpoint',
  })
  apiEndpoint?: string; // API endpoint for Travel Rule communication

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'public_key' })
  publicKey?: string; // Public key for encrypted communication

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'contact_email',
  })
  contactEmail?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'contact_phone',
  })
  contactPhone?: string;

  @Column({
    type: 'enum',
    enum: PartnerStatus,
    default: PartnerStatus.PENDING_VERIFICATION,
  })
  status: PartnerStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional partner information

  @Column({ type: 'jsonb', nullable: true, name: 'supported_protocols' })
  supportedProtocols?: string[]; // e.g., ["TRP", "IVMS101", "OpenVASP"]

  @Column({ type: 'int', default: 0, name: 'transactions_count' })
  transactionsCount: number; // Number of Travel Rule transactions processed

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'success_rate',
  })
  successRate?: number; // Success rate percentage

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
