import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('period_closures')
@Index(['orgId', 'period'], { unique: true })
@Index(['merkleRoot'])
export class PeriodClosure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  period: string; // e.g., "2025-01" (YYYY-MM)

  @Column({ type: 'uuid', name: 'org_id' })
  orgId: string;

  @Column({ type: 'uuid', name: 'locked_by' })
  lockedBy: string; // User ID who locked the period

  @Column({ type: 'timestamptz', name: 'locked_at' })
  lockedAt: Date;

  @Column({ type: 'varchar', length: 66, name: 'merkle_root' })
  merkleRoot: string; // Merkle root of all journal entries in period

  @Column({ type: 'varchar', length: 66, nullable: true, name: 'anchor_tx' })
  anchorTx?: string; // On-chain transaction hash of anchor

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
