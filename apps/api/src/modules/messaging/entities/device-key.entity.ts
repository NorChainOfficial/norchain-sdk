import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('device_keys')
@Index(['did', 'deviceId'], { unique: true })
export class DeviceKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  did: string; // DID of the user

  @Column({ type: 'varchar', length: 255, name: 'device_id' })
  deviceId: string; // Device identifier

  @Column({ type: 'text', name: 'prekey_bundle' })
  prekeyBundle: string; // Encrypted prekey bundle (JSON)

  @Column({ type: 'text', nullable: true, name: 'signed_prekey' })
  signedPrekey?: string; // Signed prekey

  @Column({ type: 'timestamptz', nullable: true, name: 'last_used_at' })
  lastUsedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
