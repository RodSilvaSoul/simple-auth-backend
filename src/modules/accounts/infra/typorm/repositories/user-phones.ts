import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import { CreateUserPhoneDTO } from '@modules/accounts/dtos';
import { IUserPhoneRepository } from '@modules/accounts/repositories';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

import { User, UserPhone, UserPhoneTypes } from '../entities';

@injectable()
export class UserPhoneRepository implements IUserPhoneRepository {
  private phoneRepository: Repository<UserPhone>;
  private phoneTypeRepository: Repository<UserPhoneTypes>;
  private userRepository: Repository<User>;

  constructor() {
    this.phoneRepository = getRepository(UserPhone);
    this.phoneTypeRepository = getRepository(UserPhoneTypes);
    this.userRepository = getRepository(User);
  }

  async save({
    type,
    id_user,
    phone_number,
  }: CreateUserPhoneDTO): Promise<CreateUserPhoneDTO> {
    const userPhoneTypes = await this.phoneTypeRepository.findOne({
      where: {
        type,
      },
    });

    const user = await this.userRepository.findOne(id_user);

    if (userPhoneTypes) {
      const userPhone = this.phoneRepository.create({
        phone_number,
        user,
        userPhoneTypes,
      });

      await this.phoneRepository.manager.save(userPhone);

      return {
        id_user,
        phone_number,
        type,
      };
    }

    return null;
  }

  async findByUserId(
    id_user: string,
  ): Promise<Either<UserNotFoundError, CreateUserPhoneDTO>> {
    const user = await this.userRepository.findOne(id_user);

    const phoneUser = await this.phoneRepository.findOne({
      where: {
        user,
      },
      relations: ['user_phones_types'],
    });

    if (!phoneUser) {
      return left(new UserNotFoundError());
    }

    const { phone_number, userPhoneTypes } = phoneUser;

    return right({
      phone_number,
      id_user,
      type: userPhoneTypes.type,
    });
  }
}
