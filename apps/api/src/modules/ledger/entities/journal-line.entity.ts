import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { LedgerAccount } from './ledger-account.entity';

export enum LineDirection {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

@Entity('journal_lines')
@Index(['entryId'])
@Index(['accountId'])
export class JournalLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'entry_id' })
  entryId: string;

  @ManyToOne(() => JournalEntry, (entry) => entry.lines, { onDelete: 'CASCADE' })
  entry: JournalEntry;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ManyToOne(() => LedgerAccount, (account) => account.journalLines)
  account: LedgerAccount;

  @Column({ type: 'varchar', length: 10, default: 'NOR' })
  currency: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string; // Use string for precision with large numbers

  @Column({
    type: 'enum',
    enum: LineDirection,
  })
  direction: LineDirection;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true, name: 'fx_rate' })
  fxRate?: string; // Exchange rate if different from native currency

  @Column({ type: 'decimal', precision: 36, scale: 18, name: 'amount_native' })
  amountNative: string; // Amount in native currency (NOR)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

