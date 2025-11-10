import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // Feature flag key (e.g., 'enable_bridge_v2')

  @Column({ type: 'text' })
  description: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conditions: {
    userIds?: string[]; // Specific user IDs
    roles?: string[]; // Specific roles
    percentage?: number; // Percentage rollout (0-100)
    startDate?: string; // Start date for gradual rollout
    endDate?: string; // End date
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
