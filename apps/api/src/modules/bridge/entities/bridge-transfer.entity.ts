import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum BridgeTransferStatus {
  PENDING = 'pending',
  PENDING_POLICY = 'pending_policy',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum BridgeChain {
  NOR = 'NOR',
  BSC = 'BSC',
  ETHEREUM = 'ETHEREUM',
  TRON = 'TRON',
}

@Entity('bridge_transfers')
export class BridgeTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: BridgeChain })
  srcChain: BridgeChain;

  @Column({ type: 'enum', enum: BridgeChain })
  dstChain: BridgeChain;

  @Column()
  asset: string; // e.g., 'BTCBR', 'ETHBR', 'NOR'

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column()
  fromAddress: string;

  @Column()
  toAddress: string;

  @Column({ type: 'enum', enum: BridgeTransferStatus, default: BridgeTransferStatus.PENDING })
  status: BridgeTransferStatus;

  @Column({ type: 'text', nullable: true })
  srcTxHash: string;

  @Column({ type: 'text', nullable: true })
  dstTxHash: string;

  @Column({ type: 'text', nullable: true })
  proof: string; // Merkle proof or inclusion proof

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  fees: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ nullable: true, unique: true })
  idempotencyKey: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

