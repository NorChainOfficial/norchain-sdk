import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { JournalLine } from './journal-line.entity';

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('ledger_accounts')
@Index(['orgId', 'code'], { unique: true })
@Index(['orgId', 'status'])
export class LedgerAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string; // e.g., "1100", "4000"

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  type: AccountType;

  @Column({ type: 'varchar', length: 10, default: 'NOR' })
  currency: string;

  @Column({ type: 'uuid', name: 'org_id' })
  orgId: string;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({ type: 'uuid', nullable: true, name: 'parent_id' })
  parentId?: string;

  @ManyToOne(() => LedgerAccount, (account) => account.children, {
    nullable: true,
  })
  parent?: LedgerAccount;

  @OneToMany(() => LedgerAccount, (account) => account.parent)
  children?: LedgerAccount[];

  @OneToMany(() => JournalLine, (line) => line.account)
  journalLines?: JournalLine[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
