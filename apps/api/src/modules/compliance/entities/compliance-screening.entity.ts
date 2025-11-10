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

export enum ScreeningStatus {
  PENDING = 'pending',
  CLEARED = 'cleared',
  FLAGGED = 'flagged',
  BLOCKED = 'blocked',
}

export enum ScreeningType {
  SANCTIONS = 'sanctions',
  AML = 'aml',
  KYC = 'kyc',
  WATCHLIST = 'watchlist',
}

@Entity('compliance_screenings')
export class ComplianceScreening {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ScreeningType })
  type: ScreeningType;

  @Column()
  subject: string; // Address, email, or other identifier

  @Column({ type: 'enum', enum: ScreeningStatus, default: ScreeningStatus.PENDING })
  status: ScreeningStatus;

  @Column({ type: 'jsonb', nullable: true })
  results: {
    listsChecked: string[];
    matches: Array<{
      list: string;
      matchType: string;
      details: any;
    }>;
    riskScore: number;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

