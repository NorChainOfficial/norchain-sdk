import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ValidatorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SLASHED = 'slashed',
  PENDING = 'pending',
}

@Entity('validators')
export class Validator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  address: string; // Validator address

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ValidatorStatus, default: ValidatorStatus.PENDING })
  status: ValidatorStatus;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  stake: string; // Staked amount

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  uptime: number; // Uptime percentage

  @Column({ type: 'int', default: 0 })
  blocksProposed: number;

  @Column({ type: 'int', default: 0 })
  blocksMissed: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceScore: number; // Compliance score (0-100)

  @Column({ nullable: true })
  location: string; // Geographic location

  @Column({ nullable: true })
  licenseNumber: string; // Regulatory license number

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    organization?: string;
    contact?: string;
    website?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

