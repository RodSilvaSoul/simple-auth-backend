import { NotFoundError } from '@shared/errors/database-query';
import { Either } from '@shared/utils';

import type { CreateUserAddressDTO } from '../dtos';
import { UserAddress } from '../infra/typorm/entities';

export interface IUserAddressRepository {
  save(param: CreateUserAddressDTO): Promise<UserAddress>;
  findByUserId(userId: string): Promise<Either<NotFoundError, UserAddress>>;
}
