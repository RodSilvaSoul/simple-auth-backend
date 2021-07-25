import { injectable } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';

import { CreteUserRefreshTokenDTO } from '@modules/accounts/dtos';
import { ITokenRepository } from '@modules/accounts/repositories';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { RefreshToken } from '../entities';

@injectable()
export class TokenRepository implements ITokenRepository {
  private readonly repository: Repository<RefreshToken>;

  constructor() {
    this.repository = getRepository(RefreshToken);
  }

  add({
    expires_in,
    id_user,
    token,
  }: CreteUserRefreshTokenDTO): Promise<RefreshToken> {
    const refreshToken = this.repository.create({
      expires_in,
      id_user,
      token,
    });

    const queryResult = this.repository.save(refreshToken);

    return queryResult;
  }
  async findByUserId(
    userId: string,
  ): Promise<Either<NotFoundError, RefreshToken>> {
    const queryResult = await this.repository.findOne({
      where: {
        id_user: userId,
      },
    });

    if (queryResult) {
      return right(queryResult);
    }

    return left(new NotFoundError(userId));
  }

  async findByToken(
    token: string,
  ): Promise<Either<NotFoundError, RefreshToken>> {
    const queryResult = await this.repository.findOne({
      where: {
        token,
      },
    });

    if (queryResult) {
      return right(queryResult);
    }

    return left(new NotFoundError(token));
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
