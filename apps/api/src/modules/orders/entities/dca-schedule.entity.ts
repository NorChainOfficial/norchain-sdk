import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('dca_schedules')
export class DCASchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userAddress: string;

  @Column()
  tokenIn: string;

  @Column()
  tokenOut: string;

  @Column('decimal', { precision: 78, scale: 0 })
  amountPerOrder: string;

  @Column()
  frequency: string;

  @Column()
  chainId: number;

  @Column({ default: 'active' })
  status: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column()
  nextExecution: Date;

  @Column({ default: 0 })
  totalExecuted: number;

  @Column('decimal', { precision: 78, scale: 0, default: '0' })
  totalSpent: string;

  @CreateDateColumn()
  createdAt: Date;
}
