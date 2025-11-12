import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiKey } from '@/modules/auth/entities/api-key.entity';

export enum UsageType {
  API_CALL = 'api_call',
  RPC_CALL = 'rpc_call',
  STREAMING_CONNECTION = 'streaming_connection',
  WEBHOOK_DELIVERY = 'webhook_delivery',
}

@Entity('api_usage')
@Index(['apiKeyId', 'timestamp'])
@Index(['userId', 'timestamp'])
@Index(['endpoint', 'timestamp'])
export class ApiUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'api_key_id', nullable: true })
  apiKeyId?: string;

  @ManyToOne(() => ApiKey, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'api_key_id' })
  apiKey?: ApiKey;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  endpoint: string; // e.g., '/api/v1/account/balance'

  @Column({ type: 'varchar', length: 10, default: 'GET' })
  method: string;

  @Column({
    type: 'enum',
    enum: UsageType,
    default: UsageType.API_CALL,
  })
  type: UsageType;

  @Column({ type: 'int', default: 1 })
  count: number; // Number of units consumed (e.g., 1 API call, 1000 RPC calls)

  @Column({ type: 'int', nullable: true })
  statusCode?: number;

  @Column({ type: 'int', nullable: true })
  responseTime?: number; // milliseconds

  @Column({ type: 'decimal', precision: 10, scale: 6, default: '0' })
  cost: string; // Cost in NOR

  @Column({ type: 'varchar', length: 50, nullable: true })
  tier?: string; // Pricing tier (free, pro, enterprise)

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

