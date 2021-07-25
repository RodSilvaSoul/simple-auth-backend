import { CreateUserDTO } from '@modules/accounts/dtos';
import { User } from '@modules/accounts/infra/typorm/entities';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { IUserRepository } from '../IUser-repository';

export class UserRepositoryInMemory implements IUserRepository {
  users: User[] = [];

  async add({ email, name, password }: CreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, {
      email,
      name,
      password,
    });

    this.users.push(user);

    return user;
  }
  async findByEmail(email: string): Promise<Either<NotFoundError, User>> {
    const user = this.users.find((user) => user.email === email);

    if (user) {
      return right(user);
    }

    return left(new NotFoundError(email));
  }

  async findById(id: string): Promise<Either<NotFoundError, User>> {
    const user = this.users.find((user) => user.id === id);

    if (user) {
      return right(user);
    }

    return left(new NotFoundError(id));
  }
}
