import { CreateOrUpdateUserPhoneDTO } from '@modules/accounts/dtos';
import { UserPhone } from '@modules/accounts/infra/typorm/entities';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

import { IUserPhoneRepository } from '../IUser-phone-repository';

export class UserPhoneInMemory implements IUserPhoneRepository {
  userPhones: UserPhone[] = [];

  async createOrUpdate(params: CreateOrUpdateUserPhoneDTO): Promise<UserPhone> {
    const userPhone = new UserPhone();

    const newUserPhone = Object.assign(userPhone, params);

    this.userPhones.push(newUserPhone);

    return newUserPhone;
  }
  async findByUserId(
    user_id: string,
  ): Promise<Either<UserNotFoundError, UserPhone>> {
    const userExists = this.userPhones.find(
      (phone) => phone.id_user === user_id,
    );

    if (!userExists) {
      return left(new UserNotFoundError());
    }

    return right(userExists);
  }
}
