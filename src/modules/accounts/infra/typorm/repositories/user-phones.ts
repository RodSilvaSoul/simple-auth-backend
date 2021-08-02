import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import { CreateOrUpdateUserPhoneDTO } from '@modules/accounts/dtos';
import { IUserPhoneRepository } from '@modules/accounts/repositories';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

import { UserPhone, UserPhoneTypes } from '../entities';

@injectable()
export class UserPhoneRepository implements IUserPhoneRepository {
  private phoneRepository: Repository<UserPhone>;
  private phoneTypeRepository: Repository<UserPhoneTypes>;

  constructor() {
    this.phoneRepository = getRepository(UserPhone);
    this.phoneTypeRepository = getRepository(UserPhoneTypes);
  }

  async createOrUpdate({
    type,
    id_user,
    phone_number,
  }: CreateOrUpdateUserPhoneDTO): Promise<UserPhone> {
    const userPhoneTypes = await this.phoneTypeRepository.findOne({
      where: {
        type,
      },
    });

    const userPhone = this.phoneRepository.create({
      phone_number,
      id_user,
      userPhoneTypes,
    });

    const newPhoneUser = await this.phoneRepository.save(userPhone);

    return newPhoneUser;
  }
  async findByUserId(
    id_user: string,
  ): Promise<Either<UserNotFoundError, UserPhone>> {
    const phoneUser = await this.phoneRepository.findOne({
      where: {
        id_user,
      },
      relations: ['user_phones_types'],
    });

    if (!phoneUser) {
      return left(new UserNotFoundError());
    }

    return right(phoneUser);
  }
}
