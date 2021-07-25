import { inject, injectable } from 'tsyringe';

import { IHasherProvider } from '@shared/container/providers/hasher';
import { IValidator } from '@shared/container/providers/validator';
import { Either, left, right } from '@shared/utils';

import { CreateUserDTO } from '../../dtos';
import { IUserRepository } from '../../repositories';
import { EmailAlredyUseError } from './erros';

@injectable()
class CreaUserUserCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('UserParamsValidator')
    private readonly userParamsValidator: IValidator<CreateUserDTO>,
    @inject('BcryptFacade')
    private readonly hasherProvider: IHasherProvider,
  ) {}

  async execute({
    email,
    name,
    password,
  }: CreateUserDTO): Promise<Either<EmailAlredyUseError, true>> {
    const haveAparamInvalid = this.userParamsValidator.check({
      email,
      name,
      password,
    });

    const emailAlredyUse = await this.userRepository.findByEmail(email);

    if (haveAparamInvalid.isLeft()) {
      return left(haveAparamInvalid.value);
    }

    if (emailAlredyUse.isRight()) {
      return left(new EmailAlredyUseError(email));
    }

    const passwordHash = await this.hasherProvider.hash(password);

    await this.userRepository.add({
      email,
      name,
      password: passwordHash,
    });

    return right(true);
  }
}

export { CreaUserUserCase };
