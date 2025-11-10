import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('ownership_challenges')
@Index(['chainId', 'address'])
export class OwnershipChallenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chainId: string;

  @Column()
  address: string;

  @Column({ type: 'text' })
  message: string; // EIP-191 signable message

  @Column()
  nonce: string; // Random nonce for uniqueness

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}

