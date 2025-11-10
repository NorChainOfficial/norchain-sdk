import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GovernanceVote } from './governance-vote.entity';

export enum ProposalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PASSED = 'passed',
  REJECTED = 'rejected',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
}

export enum ProposalType {
  PARAMETER_CHANGE = 'parameter_change',
  UPGRADE = 'upgrade',
  TREASURY = 'treasury',
  VALIDATOR = 'validator',
  GENERAL = 'general',
}

@Entity('governance_proposals')
export class GovernanceProposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  proposer: string; // Address or user ID

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProposalType })
  type: ProposalType;

  @Column({ type: 'enum', enum: ProposalStatus, default: ProposalStatus.DRAFT })
  status: ProposalStatus;

  @Column({ type: 'jsonb' })
  parameters: {
    [key: string]: any; // Proposal-specific parameters
  };

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'bigint', default: 0 })
  forVotes: string;

  @Column({ type: 'bigint', default: 0 })
  againstVotes: string;

  @Column({ type: 'bigint', default: 0 })
  abstainVotes: string;

  @Column({ type: 'bigint', nullable: true })
  quorum: string; // Required quorum threshold

  @Column({ type: 'bigint', nullable: true })
  threshold: string; // Required approval threshold

  @OneToMany(() => GovernanceVote, (vote) => vote.proposal)
  votes: GovernanceVote[];

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date;

  @Column({ type: 'text', nullable: true })
  executionTxHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

