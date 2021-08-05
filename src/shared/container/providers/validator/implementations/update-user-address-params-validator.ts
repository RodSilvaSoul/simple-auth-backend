/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'tsyringe';
import { validate as uuidValidator } from 'uuid';

import { UpdateUserAddressDTO } from '@modules/accounts/dtos';
import { InvalidParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';

@injectable()
export class UpdateUserAddressParamsValidator implements IValidator {
  check({
    id_user,
    house_number,
    ...rest
  }: UpdateUserAddressDTO): Either<Error, true> {
    if (!uuidValidator(id_user)) {
      return left(
        new InvalidParamError('The id_user does not have a valid uuid format'),
      );
    }

    const params: string[] = Object.values(rest);

    const invalidParam = params.find((field) => {
      if (field.length < 3) {
        return true;
      }

      return false;
    });

    if (invalidParam) {
      const invalidParamIndex = params.indexOf(invalidParam);
      const fields = Object.keys(invalidParam);

      return left(
        new InvalidParamError(
          `The param: ${fields[invalidParamIndex]} is invalid.`,
        ),
      );
    }

    if (rest?.postal_code.length < 7) {
      return left(
        new InvalidParamError('The param postal_code sent is not valid'),
      );
    }

    return right(true);
  }
}
