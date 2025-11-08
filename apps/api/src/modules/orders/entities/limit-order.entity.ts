import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('limit_orders')
export class LimitOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userAddress: string;

  @Column()
  tokenIn: string;

  @Column()
  tokenOut: string;

  @Column('decimal', { precision: 78, scale: 0 })
  amountIn: string;

  @Column('decimal', { precision: 78, scale: 0 })
  amountOutMin: string;

  @Column('decimal', { precision: 78, scale: 0 })
  priceLimit: string;

  @Column()
  chainId: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  txHash: string;

  @Column('decimal', { precision: 78, scale: 0, default: '0' })
  filledAmount: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  filledAt: Date;
}
