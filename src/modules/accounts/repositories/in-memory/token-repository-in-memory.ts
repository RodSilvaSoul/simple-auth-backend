import { CreteUserTokenDTO } from '@modules/accounts/dtos';
import { RefreshToken } from '@modules/accounts/infra/typorm/entities';
import { NotFoundError } from '@shared/errors/database-query';
import { Either, left, right } from '@shared/utils';

import { ITokenRepository } from '../IToken-repository';

export class TokenRepositoryInMemory implements ITokenRepository {
  refreshTokens: RefreshToken[] = [];

  async add({
    expires_in,
    id_user,
    token,
  }: CreteUserTokenDTO): Promise<RefreshToken> {
    const refreshToken = new RefreshToken();

    Object.assign(refreshToken, {
      expires_in,
      id_user,
      token,
    });

    this.refreshTokens.push(refreshToken);

    return refreshToken;
  }
  async findByUserId(
    userId: string,
  ): Promise<Either<NotFoundError, RefreshToken>> {
    const refreshToken = this.refreshTokens.find(
      (token) => token.id_user === userId,
    );

    if (refreshToken) {
      return right(refreshToken);
    }

    return left(new NotFoundError(userId));
  }
  async findByToken(
    token: string,
  ): Promise<Either<NotFoundError, RefreshToken>> {
    const refreshToken = this.refreshTokens.find(
      (refeshToken) => refeshToken.token === token,
    );

    if (refreshToken) {
      return right(refreshToken);
    }

    return left(new NotFoundError(token));
  }
  async deleteById(id: string): Promise<void> {
    const refreshTokens = this.refreshTokens.filter(
      (token) => token.id !== id,
    );

    this.refreshTokens = refreshTokens;
  }
}
