import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('stop_loss_orders')
export class StopLossOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userAddress: string;

  @Column()
  tokenIn: string;

  @Column()
  tokenOut: string;

  @Column('decimal', { precision: 78, scale: 0 })
  amount: string;

  @Column('decimal', { precision: 78, scale: 0 })
  stopPrice: string;

  @Column()
  chainId: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  triggeredAt: Date;
}
