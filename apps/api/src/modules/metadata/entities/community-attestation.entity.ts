import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AssetProfile } from './asset-profile.entity';

@Entity('community_attestations')
@Index(['profileId', 'signerAddress'], { unique: true })
export class CommunityAttestation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => AssetProfile, (profile) => profile.attestations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: AssetProfile;

  @Column()
  signerAddress: string;

  @Column({ type: 'text' })
  signature: string;

  @Column({ type: 'text', nullable: true })
  rationale: string;

  @CreateDateColumn()
  createdAt: Date;
}

