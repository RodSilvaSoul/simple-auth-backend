import { injectable, inject } from 'tsyringe';

import { ResetPasswordDTO } from '@modules/accounts/dtos';
import {
  ITokenRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import { IDateProvider, IHasherProvider } from '@shared/container/providers';
import { Either, left, right } from '@shared/utils/either';

import { InvalidTokenError } from './errors';

@injectable()
export class ResetPasswordUserUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepistory: IUserRepository,
    @inject('TokenRepository')
    private readonly tokenRepository: ITokenRepository,
    @inject('DayjsFacade')
    private readonly dateProvider: IDateProvider,
    @inject('BcryptFacade')
    private readonly hasherProvider: IHasherProvider,
  ) {}

  async execute({
    token,
    password,
  }: ResetPasswordDTO): Promise<Either<InvalidTokenError, true>> {
    const userToken = await this.tokenRepository.findByToken(token.replace('\n', ''));

    if (userToken.isLeft()) {
      return left(new InvalidTokenError());
    }

    if (
      this.dateProvider.compareIfBefore(
        userToken.value.expires_in,
        this.dateProvider.dateNow(),
      )
    ) {
      return left(new InvalidTokenError());
    }

    const { id_user, id } = userToken.value;

    const user = await this.userRepistory.findById(id_user);

    if (user.isRight()) {
      user.value.password = await this.hasherProvider.hash(password);
      await this.userRepistory.add(user.value);

      await this.tokenRepository.deleteById(id);
    }

    return right(true);
  }
}
