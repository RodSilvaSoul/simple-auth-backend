import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user';

@Entity('user_address')
export class UserAddress {
  @PrimaryColumn()
  id: string;

  id_user: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column()
  country: string;

  @Column()
  district: string;

  @Column()
  city: string;

  @Column()
  postal_code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
