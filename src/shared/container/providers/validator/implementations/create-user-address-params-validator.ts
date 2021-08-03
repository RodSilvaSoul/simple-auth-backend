import { injectable } from 'tsyringe';

import { CreateUserAddressDTO } from '@modules/accounts/dtos';
import { InvalidParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';

@injectable()
export class CreateUserAddressParamsValidator
implements IValidator<CreateUserAddressDTO> {
  check(params: CreateUserAddressDTO): Either<Error, true> {
    const values = Object.values(params);

    const invalidParam = values.find((param) => {
      if (!param.toString() || param.toString().length < 4) {
        return true;
      }
      return false;
    });

    if (invalidParam) {
      const invalidParamIndex = values.indexOf(invalidParam);

      const keys = Object.keys(params);

      const invalid = keys[invalidParamIndex];

      return left(
        new InvalidParamError(
          `The params ${invalid} is blank or with length less than 4 characters`,
        ),
      );
    }

    return right(true);
  }
}
