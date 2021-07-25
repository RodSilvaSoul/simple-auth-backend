import { Either } from '@shared/utils';

export interface IValidator<T = any> {
  check(input: T): Either<Error, true>;
}
