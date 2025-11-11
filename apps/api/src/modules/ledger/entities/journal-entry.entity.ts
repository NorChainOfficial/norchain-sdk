import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { JournalLine } from './journal-line.entity';

export enum JournalEntryStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  VOID = 'void',
}

@Entity('journal_entries')
@Index(['orgId', 'eventType', 'eventId'], { unique: true })
@Index(['orgId', 'period'])
@Index(['txHash'])
@Index(['blockNo'])
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'org_id' })
  orgId: string;

  @Column({ type: 'varchar', length: 100, name: 'event_type' })
  eventType: string; // e.g., "payment.succeeded", "swap.executed"

  @Column({ type: 'varchar', length: 255, name: 'event_id' })
  eventId: string; // External event ID (payment ID, swap ID, etc.)

  @Column({ type: 'varchar', length: 66, nullable: true, name: 'tx_hash' })
  txHash?: string; // On-chain transaction hash

  @Column({ type: 'bigint', nullable: true, name: 'block_no' })
  blockNo?: number;

  @Column({ type: 'timestamptz', name: 'occurred_at' })
  occurredAt: Date; // When the event actually happened

  @Column({
    type: 'timestamptz',
    name: 'booked_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  bookedAt: Date; // When the entry was booked

  @Column({ type: 'varchar', length: 20 })
  period: string; // e.g., "2025-01" (YYYY-MM)

  @Column({ type: 'text', nullable: true })
  memo?: string;

  @Column({
    type: 'enum',
    enum: JournalEntryStatus,
    default: JournalEntryStatus.DRAFT,
  })
  status: JournalEntryStatus;

  @OneToMany(() => JournalLine, (line) => line.entry, { cascade: true })
  lines: JournalLine[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
