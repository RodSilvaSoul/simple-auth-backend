import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '.';
import { UserPhoneTypes } from './user_phone_types';

@Entity('user_phones')
export class UserPhone {
  @PrimaryColumn()
  id: string;

  id_user_phone_types: string;

  id_user: string;

  @ManyToOne(() => UserPhoneTypes, (userPhoneTypes) => userPhoneTypes.userPhone)
  @JoinColumn({ name: 'id_user_phone_types' })
  userPhoneTypes: UserPhoneTypes;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column()
  phone_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
