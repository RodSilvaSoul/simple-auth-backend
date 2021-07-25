import { inject, injectable } from 'tsyringe';

import {
  IUserRepository,
  ITokenRepository,
} from '@modules/accounts/repositories';
import { IDateProvider } from '@shared/container/providers';
import { Either, left, right } from '@shared/utils';

import { InvalidTokenError } from '../reset-password-user/errors';

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepistory: IUserRepository,
    @inject('TokenRepository')
    private readonly tokenRepository: ITokenRepository,
    @inject('DayjsFacade')
    private readonly dateProvider: IDateProvider,
  ) {}

  async execute(
    token: string,
  ): Promise<Either<InvalidTokenError, true>> {
    const tokenExists = await this.tokenRepository.findByToken(token);

    if (tokenExists.isLeft()) {
      return left(new InvalidTokenError());
    }

    const { expires_in, id, id_user } = tokenExists.value;

    if (
      this.dateProvider.compareIfBefore(expires_in, this.dateProvider.dateNow())
    ) {
      return left(new InvalidTokenError());
    }

    const user = await this.userRepistory.findById(id_user);

    if (user.isRight()) {
      user.value.isVerified = true;

      await this.userRepistory.add(user.value);
    }

    await this.tokenRepository.deleteById(id);

    return right(true);
  }
}
