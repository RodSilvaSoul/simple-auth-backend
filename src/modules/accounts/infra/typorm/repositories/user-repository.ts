import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import { CreateUserDTO } from '@modules/accounts/dtos';
import { IUserRepository } from '@modules/accounts/repositories';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { User } from '../entities';

@injectable()
export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = getRepository(User);
  }

  async add({
    email,
    name,
    password,
    avatar_url,
    id,
  }: CreateUserDTO): Promise<User> {
    const user = this.repository.create({
      avatar_url,
      email,
      id,
      name,
      password,
    });

    const queryResult = await this.repository.save(user);

    return queryResult;
  }

  async findByEmail(email: string): Promise<Either<NotFoundError, User>> {
    const queryResult = await this.repository.findOne({
      where: {
        email,
      },
    });

    if (queryResult) {
      return right(queryResult);
    }

    return left(new NotFoundError(email));
  }

  async findById(id: string): Promise<Either<NotFoundError, User>> {
    const queryResult = await this.repository.findOne(id);

    if (queryResult) {
      return right(queryResult);
    }

    return left(new NotFoundError(id));
  }
}