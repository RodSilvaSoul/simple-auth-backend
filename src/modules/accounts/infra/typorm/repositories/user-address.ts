import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import { CreateOrUpdateUserAddressDTO } from '@modules/accounts/dtos';
import { IUserAddressRepository } from '@modules/accounts/repositories';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { UserAddress } from '../entities';

@injectable()
export class UserAddressRepository implements IUserAddressRepository {
  private addressRepository: Repository<UserAddress>;

  constructor() {
    this.addressRepository = getRepository(UserAddress);
  }

  async createOrUpdate({
    city,
    district,
    house_number,
    id_user,
    postal_code,
  }: CreateOrUpdateUserAddressDTO): Promise<UserAddress> {
    const address = this.addressRepository.create({
      city,
      district,
      house_number,
      postal_code,
      id_user,
    });

    const result = await this.addressRepository.manager.save(address);

    return result;
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
}