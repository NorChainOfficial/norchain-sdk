import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Reconciliation } from './reconciliation.entity';

export enum MatchType {
  EXACT = 'exact', // Amount and date match exactly
  FUZZY = 'fuzzy', // Amount matches, date is close
  MANUAL = 'manual', // Manually matched by user
}

@Entity('reconciliation_matches')
@Index(['reconciliationId'])
@Index(['ledgerEntryId'])
export class ReconciliationMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'reconciliation_id' })
  reconciliationId: string;

  @ManyToOne(() => Reconciliation, (reconciliation) => reconciliation.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reconciliation_id' })
  reconciliation: Reconciliation;

  @Column({ type: 'uuid', nullable: true, name: 'ledger_entry_id' })
  ledgerEntryId?: string; // Journal entry ID

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'external_transaction_id' })
  externalTransactionId?: string; // External transaction reference

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ type: 'timestamp' })
  transactionDate: Date;

  @Column({
    type: 'enum',
    enum: MatchType,
    default: MatchType.EXACT,
  })
  matchType: MatchType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'confidence_score' })
  confidenceScore?: number; // 0-100 for fuzzy matches

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

