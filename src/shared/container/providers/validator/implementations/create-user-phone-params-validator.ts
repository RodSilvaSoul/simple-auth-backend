import { CreateUserPhoneDTO } from '@modules/accounts/dtos';
import { InvalidParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';

export class CreateUserPhoneParamsValidator implements IValidator {
  check(input: CreateUserPhoneDTO): Either<Error, true> {
    if (input.phone_number.length < 9) {
      return left(
        new InvalidParamError(
          'The param: phone_number have less than 9 characters',
        ),
      );
    }

    return right(true);
  }
}
