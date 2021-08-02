import { inject, injectable } from 'tsyringe';

import { IHasherProvider } from '@shared/container/providers/hasher';
import { IValidator } from '@shared/container/providers/validator';
import { Either, left, right } from '@shared/utils';

import { CreateUserDTO } from '../../dtos';
import { IUserRepository } from '../../repositories';
import { EmailAlreadyUseError } from './errors';

@injectable()
class CreatUserUserCase {
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
  }: CreateUserDTO): Promise<Either<EmailAlreadyUseError, true>> {
    const haveAInvalidParam = this.userParamsValidator.check({
      email,
      name,
      password,
    });

    const emailAlreadyUse = await this.userRepository.findByEmail(email);

    if (haveAInvalidParam.isLeft()) {
      return left(haveAInvalidParam.value);
    }

    if (emailAlreadyUse.isRight()) {
      return left(new EmailAlreadyUseError(email));
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

export { CreatUserUserCase };
