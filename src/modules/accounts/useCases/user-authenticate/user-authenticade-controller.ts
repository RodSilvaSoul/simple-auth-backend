import { singleton, inject } from 'tsyringe';

import { IValidator } from '@shared/container/providers';
import { BodyRequestValidatorParams } from '@shared/container/providers/validator/implementations';
import {
  HttpRequest,
  HttpResponse,
  badRequest,
  ok,
  serverError,
  unauthorized,
} from '@shared/http';
import { IController } from '@shared/ports/controller';

import { UserAuthenticateUseCase } from './user-authenticate-useCase';

@singleton()
export class UserAuthenticateController implements IController {
  constructor(
    @inject('UserAuthenticateUseCase')
    private readonly userAuthenticateUseCase: UserAuthenticateUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator<BodyRequestValidatorParams>,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.bodyRequestValidator.check({
        body,
        fields: ['password', 'email'],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const result = await this.userAuthenticateUseCase.execute(body);

      if (result.isLeft()) {
        return unauthorized(result.value);
      }

      return ok(result.value);
    } catch (error) {
      return serverError();
    }
  }
}
