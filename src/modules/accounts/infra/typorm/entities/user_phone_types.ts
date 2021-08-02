import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserPhone } from './user_phone';

@Entity('user_phones_types')
export class UserPhoneTypes {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;

  @OneToMany(() => UserPhone, (userPhone) => userPhone.userPhoneTypes)
  userPhone?: UserPhone[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
