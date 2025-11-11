import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('messaging_profiles')
@Index(['did'], { unique: true })
@Index(['address'])
export class MessagingProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  did: string; // e.g., "did:pkh:eip155:65001:0x..."

  @Column({ type: 'varchar', length: 42 })
  address: string; // Wallet address

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'display_name',
  })
  displayName?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
