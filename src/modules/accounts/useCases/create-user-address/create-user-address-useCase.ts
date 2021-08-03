import { inject, injectable } from 'tsyringe';

import { CreateUserAddressDTO } from '@modules/accounts/dtos';
import { UserAddress } from '@modules/accounts/infra/typorm/entities';
import {
  IUserAddressRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import { IValidator } from '@shared/container/providers';
import { UserNotFoundError } from '@shared/errors/useCase';
import { Either, left, right } from '@shared/utils';

@injectable()
export class CreateUserAddressUseCase {
  constructor(
    @inject('UserAddressRepository')
    private readonly UserAddressRepository: IUserAddressRepository,
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @inject('CreateUserAddressParamsValidator')
    private readonly validator: IValidator<CreateUserAddressDTO>,
  ) {}

  async execute({
    state,
    id_user,
    city,
    district,
    house_number,
    postal_code,
  }: CreateUserAddressDTO): Promise<Either<UserNotFoundError, UserAddress>> {
    const haveAInvalidParam = this.validator.check({
      city,
      district,
      house_number,
      id_user,
      postal_code,
      state,
    });

    if (haveAInvalidParam.isLeft()) {
      return left(haveAInvalidParam.value);
    }

    const userExits = await this.userRepository.findById(id_user);

    if (userExits.isLeft()) {
      return left(new UserNotFoundError());
    }

    const address = await this.UserAddressRepository.save({
      id_user,
      city,
      district,
      state,
      house_number,
      postal_code,
    });

    return right(address);
  }
}
