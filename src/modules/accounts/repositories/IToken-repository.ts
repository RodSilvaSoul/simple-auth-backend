import { NotFoundError } from '@shared/errors/database-query';
import { Either } from '@shared/utils';

import { CreteUserRefreshTokenDTO } from '../dtos';
import { RefreshToken } from '../infra/typorm/entities';

export interface ITokenRepository {
  add(params: CreteUserRefreshTokenDTO): Promise<RefreshToken>;
  findByUserId(userId: string): Promise<Either<NotFoundError, RefreshToken>>;
  findByToken(
    token: string
  ): Promise<Either<NotFoundError, RefreshToken>>;
  deleteById(id: string): Promise<void>;
}
