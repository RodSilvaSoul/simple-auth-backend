import { inject, injectable } from 'tsyringe';

import { CreateOrUpdateUserPhoneDTO } from '@modules/accounts/dtos';
import { UserPhone } from '@modules/accounts/infra/typorm/entities';
import {
  IUserPhoneRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

@injectable()
export class CreateOrUpdateUserPhoneUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('UserPhoneRepository')
    private readonly userPhoneRepository: IUserPhoneRepository,
  ) {}

  async execute({
    id_user,
    phone_number,
    type,
  }: CreateOrUpdateUserPhoneDTO): Promise<
    Either<UserNotFoundError, UserPhone>
  > {
    const userExists = await this.userRepository.findById(id_user);

    if (userExists.isLeft()) {
      return left(new UserNotFoundError());
    }

    const result = await this.userPhoneRepository.createOrUpdate({
      id_user,
      phone_number,
      type,
    });

    return right(result);
  }
}
