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

export enum WebhookEventType {
  TRANSACTION_MINED = 'transaction.mined',
  SWAP_EXECUTED = 'swap.executed',
  BRIDGE_STATUS_CHANGED = 'bridge.status_changed',
  GOVERNANCE_STATE_CHANGED = 'governance.state_changed',
  COMPLIANCE_CASE_UPDATED = 'compliance.case_updated',
  PROPOSAL_STATE_CHANGED = 'governance.proposal_state_changed',
}

export enum WebhookStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  FAILED = 'failed',
}

@Entity('webhook_subscriptions')
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  url: string; // Webhook URL

  @Column('simple-array')
  events: WebhookEventType[]; // Subscribed events

  @Column({ type: 'enum', enum: WebhookStatus, default: WebhookStatus.ACTIVE })
  status: WebhookStatus;

  @Column()
  secret: string; // HMAC secret for signing

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

