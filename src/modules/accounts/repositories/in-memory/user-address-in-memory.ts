import { CreateUserAddressDTO } from '@modules/accounts/dtos';
import { UserAddress } from '@modules/accounts/infra/typorm/entities';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { IUserAddressRepository } from '..';

export class UserAddressInMemoryRepository implements IUserAddressRepository {
  public address: UserAddress[] = [];

  async save(params: CreateUserAddressDTO): Promise<CreateUserAddressDTO> {
    const userAddress = new UserAddress();

    const newUserAddress = Object.assign(userAddress, params);

    this.address.push(newUserAddress);

    return params;
  }

  async findByUserId(
    userId: string,
  ): Promise<Either<NotFoundError, UserAddress>> {
    const userExists = this.address.find(
      (address) => address.id_user === userId,
    );

    if (userExists) {
      return left(new NotFoundError(userId));
    }

    return right(userExists);
  }
}
