import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('message_reactions')
@Index(['messageId', 'userDid'], { unique: true })
@Index(['messageId'])
export class MessageReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'message_id' })
  messageId: string;

  @Column({ type: 'varchar', length: 255, name: 'user_did' })
  userDid: string; // DID of user who reacted

  @Column({ type: 'varchar', length: 50 })
  emoji: string; // e.g., "👍", "❤️", "😂"

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

