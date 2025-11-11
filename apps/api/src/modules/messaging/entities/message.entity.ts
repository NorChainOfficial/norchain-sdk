import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('messages')
@Index(['conversationId'])
@Index(['senderDid'])
@Index(['sentAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId: string;

  @Column({ type: 'varchar', length: 255, name: 'sender_did' })
  senderDid: string; // DID of sender

  @Column({ type: 'text', name: 'cipher_text' })
  cipherText: string; // Encrypted message (base64)

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'media_ref' })
  mediaRef?: string; // Reference to media file (encrypted)

  @Column({ type: 'jsonb', nullable: true, name: 'delivered_to' })
  deliveredTo?: string[]; // Array of DIDs who received the message

  @Column({ type: 'jsonb', nullable: true, name: 'read_by' })
  readBy?: string[]; // Array of DIDs who read the message

  @Column({ type: 'timestamptz', name: 'sent_at' })
  sentAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'client_nonce' })
  clientNonce?: string; // Client-provided nonce for idempotency

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
