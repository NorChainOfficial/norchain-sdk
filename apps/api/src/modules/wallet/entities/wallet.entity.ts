import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WalletAccount } from './wallet-account.entity';
import { User } from '@/modules/auth/entities/user.entity';

/**
 * Wallet Entity
 *
 * Represents a user's wallet containing multiple accounts.
 * Wallets can be created from mnemonic phrases or imported from private keys.
 */
@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  mnemonicHash: string; // Hashed mnemonic (never store plain mnemonic)

  @Column({ default: false })
  isImported: boolean; // true if imported from private key, false if created

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional wallet metadata

  @OneToMany(() => WalletAccount, (account) => account.wallet, {
    cascade: true,
    eager: false,
  })
  accounts: WalletAccount[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

