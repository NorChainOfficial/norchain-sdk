import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

/**
 * Wallet Account Entity
 *
 * Represents an account derived from a wallet.
 * Each wallet can have multiple accounts (derived from the same mnemonic).
 */
@Entity('wallet_accounts')
export class WalletAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column()
  address: string;

  @Column({ nullable: true })
  publicKey: string;

  @Column({ default: 0 })
  index: number; // Account derivation index

  @Column({ nullable: true })
  derivationPath: string; // e.g., "m/44'/60'/0'/0/0"

  @Column({ nullable: true })
  label: string; // User-friendly label for the account

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional account metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
