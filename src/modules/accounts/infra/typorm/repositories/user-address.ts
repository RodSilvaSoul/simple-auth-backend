import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import {
  CreateUserAddressDTO,
  UpdateUserAddressDTO,
} from '@modules/accounts/dtos';
import { IUserAddressRepository } from '@modules/accounts/repositories';
import { ErrorOnUpdate, NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { UserAddress } from '../entities';

@injectable()
export class UserAddressRepository implements IUserAddressRepository {
  private addressRepository: Repository<UserAddress>;

  constructor() {
    this.addressRepository = getRepository(UserAddress);
  }

  async save({
    city,
    district,
    house_number,
    state,
    id_user,
    postal_code,
  }: CreateUserAddressDTO): Promise<CreateUserAddressDTO> {
    const address = this.addressRepository.create({
      city,
      district,
      state,
      house_number,
      postal_code,
      id_user,
    });

    await this.addressRepository.save(address);

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
    const userAddress = await this.addressRepository.findOne({
      where: {
        id_user,
      },
    });

    if (!userAddress) {
      return left(new NotFoundError(id_user));
    }

    return right(userAddress);
  }

  async update({
    city,
    district,
    house_number,
    id_user,
    postal_code,
    state,
  }: UpdateUserAddressDTO): Promise<Either<ErrorOnUpdate, true>> {
    const result = await this.addressRepository.update(id_user, {
      city,
      postal_code,
      state,
      district,
      house_number,
    });

    if (!result.affected) {
      return left(new ErrorOnUpdate());
    }

    return right(true);
  }
}
