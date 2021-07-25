import { singleton, inject } from 'tsyringe';

import { IValidator } from '@shared/container/providers';
import { BodyRequestValidatorParams } from '@shared/container/providers/validator/implementations';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
  unauthorized,
} from '@shared/http';
import { IController } from '@shared/ports';

import { ResetPasswordUserUseCase } from './reset-password-user-useCase';

@singleton()
export class ResetPasswordUserController implements IController {
  constructor(
    @inject('ResetPasswordUserUseCase')
    private readonly resetPasswordUserUseCase: ResetPasswordUserUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator<BodyRequestValidatorParams>,
  ) {}

  async handle({ body, query }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyValid = this.bodyRequestValidator.check({
        body,
        fields: ['password'],
      });

      if (isBodyValid.isLeft()) {
        return badRequest(isBodyValid.value);
      }

      const { password } = body;
      const { token } = query;

      const result = await this.resetPasswordUserUseCase.execute({
        password,
        token,
      });

      if (result.isLeft()) {
        return unauthorized(result.value);
      }

      return ok();
    } catch {
      return serverError();
    }
  }
}
