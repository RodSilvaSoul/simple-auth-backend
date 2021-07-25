import { NotFoundError } from '@shared/errors/database-query';
import { Either } from '@shared/utils';

import { CreateUserDTO } from '../dtos/create-user-DTO';
import { User } from '../infra/typorm/entities';

export interface IUserRepository {
  add(params: CreateUserDTO): Promise<User>;
  findByEmail(email: string): Promise<Either<NotFoundError, User>>;
  findById(id: string): Promise<Either<NotFoundError, User>>;
}