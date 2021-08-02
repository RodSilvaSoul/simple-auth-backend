import { NotFoundError } from '@shared/errors/database-query';
import { Either } from '@shared/utils';

import type { CreateOrUpdateUserAddressDTO } from '../dtos';
import { UserAddress } from '../infra/typorm/entities';

export interface IUserAddressRepository {
  createOrUpdate(param: CreateOrUpdateUserAddressDTO): Promise<UserAddress>;
  findByUserId(userId: string): Promise<Either<NotFoundError, UserAddress>>;
}
