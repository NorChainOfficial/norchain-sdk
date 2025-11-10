import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WebhookSubscription } from './webhook-subscription.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

@Entity('webhook_deliveries')
@Index(['subscriptionId', 'createdAt'])
@Index(['status', 'createdAt'])
export class WebhookDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  subscriptionId: string;

  @ManyToOne(() => WebhookSubscription)
  @JoinColumn({ name: 'subscriptionId' })
  subscription: WebhookSubscription;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: any; // CloudEvents 1.0 format

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @Column({ type: 'int', default: 0 })
  attemptCount: number;

  @Column({ type: 'text', nullable: true })
  signature: string; // HMAC signature

  @Column({ type: 'int', nullable: true })
  httpStatus: number;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

