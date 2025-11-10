import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ConversationKind {
  P2P = 'p2p',
  GROUP = 'group',
  CHANNEL = 'channel',
}

@Entity('conversations')
@Index(['kind'])
@Index(['createdBy'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConversationKind,
  })
  kind: ConversationKind;

  @Column({ type: 'varchar', length: 255, name: 'created_by' })
  createdBy: string; // DID

  @Column({ type: 'jsonb' })
  members: string[]; // Array of DIDs

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string; // For groups/channels

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

