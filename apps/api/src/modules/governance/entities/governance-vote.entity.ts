import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { GovernanceProposal } from './governance-proposal.entity';

export enum VoteChoice {
  FOR = 'for',
  AGAINST = 'against',
  ABSTAIN = 'abstain',
}

@Entity('governance_votes')
@Unique(['proposalId', 'voter'])
export class GovernanceVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  proposalId: string;

  @ManyToOne(() => GovernanceProposal, (proposal) => proposal.votes)
  @JoinColumn({ name: 'proposalId' })
  proposal: GovernanceProposal;

  @Column()
  voter: string; // Address or user ID

  @Column({ type: 'enum', enum: VoteChoice })
  choice: VoteChoice;

  @Column({ type: 'bigint' })
  weight: string; // Voting power/weight

  @Column({ type: 'text', nullable: true })
  reason: string; // Optional reason for vote

  @CreateDateColumn()
  createdAt: Date;
}

