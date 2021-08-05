import { injectable } from 'tsyringe';
import { validate as uuidValidator } from 'uuid';

import { CreateUserAddressDTO } from '@modules/accounts/dtos';
import { InvalidParamError } from '@shared/errors/validator';
import { Either, left, right } from '@shared/utils';

import { IValidator } from '../IValidator';

@injectable()
export class CreateUserAddressParamsValidator implements IValidator {
  check(params: CreateUserAddressDTO): Either<Error, true> {
    if (!uuidValidator(params.id_user)) {
      return left(
        new InvalidParamError('The id_user does not have a valid uuid format'),
      );
    }

    const haveAParamLessThan3Characters = ['city', 'district', 'state'].find(
      (field) => {
        if (String(params[field]).length < 3) {
          return true;
        }

        return false;
      },
    );

    if (haveAParamLessThan3Characters) {
      return left(
        new InvalidParamError(
          `The param: ${haveAParamLessThan3Characters} is invalid.`,
        ),
      );
    }

    if (params.postal_code.length < 7) {
      return left(
        new InvalidParamError('The param postal_code sent is not valid'),
      );
    }

    return right(true);
  }
}
