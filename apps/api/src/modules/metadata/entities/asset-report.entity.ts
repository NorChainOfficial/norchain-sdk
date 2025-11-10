import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssetProfile } from './asset-profile.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('asset_reports')
export class AssetReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => AssetProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: AssetProfile;

  @Column({ type: 'uuid', nullable: true })
  reporterId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
