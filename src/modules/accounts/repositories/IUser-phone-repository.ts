import { UserNotFoundError } from '@shared/errors/useCase';
import { Either } from '@shared/utils';

import { CreateOrUpdateUserPhoneDTO } from '../dtos';
import { UserPhone } from '../infra/typorm/entities';

export interface IUserPhoneRepository {
  createOrUpdate(params: CreateOrUpdateUserPhoneDTO):Promise<UserPhone> ;
  findByUserId(user_id: string): Promise<Either<UserNotFoundError, UserPhone>>
}
