import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ReconciliationMatch } from './reconciliation-match.entity';

export enum ReconciliationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  MATCHED = 'matched',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
}

export enum ReconciliationType {
  BANK = 'bank',
  WALLET = 'wallet',
  CRYPTO_EXCHANGE = 'crypto_exchange',
}

@Entity('reconciliations')
@Index(['orgId', 'type', 'status'])
@Index(['orgId', 'period'])
export class Reconciliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'org_id' })
  orgId: string;

  @Column({
    type: 'enum',
    enum: ReconciliationType,
  })
  type: ReconciliationType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  accountCode?: string; // Ledger account code

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalAccountId?: string; // Bank account number, wallet address, etc.

  @Column({ type: 'varchar', length: 20 })
  period: string; // e.g., "2025-01"

  @Column({ type: 'timestamp', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamp', name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ReconciliationStatus,
    default: ReconciliationStatus.PENDING,
  })
  status: ReconciliationStatus;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    default: '0',
    name: 'opening_balance',
  })
  openingBalance: string;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    default: '0',
    name: 'closing_balance',
  })
  closingBalance: string;

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    default: '0',
    name: 'ledger_total',
  })
  ledgerTotal: string; // Sum of ledger movements

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    default: '0',
    name: 'external_total',
  })
  externalTotal: string; // Sum of external transactions

  @Column({
    type: 'decimal',
    precision: 36,
    scale: 18,
    default: '0',
    name: 'difference',
  })
  difference: string; // ledgerTotal - externalTotal

  @Column({ type: 'int', default: 0, name: 'matched_count' })
  matchedCount: number;

  @Column({ type: 'int', default: 0, name: 'unmatched_ledger_count' })
  unmatchedLedgerCount: number;

  @Column({ type: 'int', default: 0, name: 'unmatched_external_count' })
  unmatchedExternalCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional reconciliation data

  @OneToMany(() => ReconciliationMatch, (match) => match.reconciliation)
  matches?: ReconciliationMatch[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
