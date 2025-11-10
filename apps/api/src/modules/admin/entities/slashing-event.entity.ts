import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Validator } from './validator.entity';

export enum SlashingReason {
  DOUBLE_SIGN = 'double_sign',
  DOWNTIME = 'downtime',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  OTHER = 'other',
}

@Entity('slashing_events')
export class SlashingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  validatorId: string;

  @ManyToOne(() => Validator)
  @JoinColumn({ name: 'validatorId' })
  validator: Validator;

  @Column({ type: 'enum', enum: SlashingReason })
  reason: SlashingReason;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  slashedAmount: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  txHash: string;

  @Column({ type: 'bigint', nullable: true })
  blockNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}

