import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ComplianceScreening } from './compliance-screening.entity';

export enum CaseStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum CaseSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('compliance_cases')
export class ComplianceCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string; // Address, user ID, or transaction hash

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.OPEN })
  status: CaseStatus;

  @Column({ type: 'enum', enum: CaseSeverity, default: CaseSeverity.MEDIUM })
  severity: CaseSeverity;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedScreenings: string[]; // Array of screening IDs

  @Column({ type: 'text', nullable: true })
  assignedTo: string; // User ID of compliance officer

  @Column({ type: 'jsonb', nullable: true })
  notes: Array<{
    author: string;
    content: string;
    timestamp: Date;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

