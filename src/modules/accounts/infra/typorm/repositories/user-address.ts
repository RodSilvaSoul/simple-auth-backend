import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import { CreateUserAddressDTO } from '@modules/accounts/dtos';
import { IUserAddressRepository } from '@modules/accounts/repositories';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { User, UserAddress } from '../entities';

@injectable()
export class UserAddressRepository implements IUserAddressRepository {
  private addressRepository: Repository<UserAddress>;
  private userRepository: Repository<User>;
  constructor() {
    this.addressRepository = getRepository(UserAddress);
    this.userRepository = getRepository(User);
  }

  async save({
    city,
    district,
    house_number,
    state,
    id_user,
    postal_code,
  }: CreateUserAddressDTO): Promise<CreateUserAddressDTO> {
    const user = await this.userRepository.findOne(id_user);

    const address = this.addressRepository.create({
      city,
      district,
      state,
      house_number,
      postal_code,
      user,
    });

    await this.addressRepository.manager.save(address);

    return {
      city,
      district,
      house_number,
      state,
      id_user,
      postal_code,
    };
  }
  async findByUserId(
    id_user: string,
  ): Promise<Either<NotFoundError, UserAddress>> {
    const user = await this.userRepository.findOne(id_user);

    const userAddress = await this.addressRepository.findOne({
      where: {
        user,
      },
    });

    if (!userAddress) {
      return left(new NotFoundError(id_user));
    }

    return right(userAddress);
  }
}
