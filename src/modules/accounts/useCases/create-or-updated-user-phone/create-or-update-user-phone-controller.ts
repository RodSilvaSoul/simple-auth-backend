import { inject, singleton } from 'tsyringe';

import { CreateOrUpdateUserPhoneDTO } from '@modules/accounts/dtos';
import { IValidator } from '@shared/container/providers';
import { BodyRequestValidatorParams } from '@shared/container/providers/validator/implementations';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { CreateOrUpdateUserPhoneUseCase } from './create-or-update-user-phone-useCase';

@singleton()
export class CreateOrUpdateUserPhoneController implements IController {
  constructor(
    @inject('CreateOrUpdateUserPhoneUseCase')
    private readonly createOrUpdateUserPhoneUseCase: CreateOrUpdateUserPhoneUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator<BodyRequestValidatorParams>,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const haveBodyInvalidParams = this.bodyRequestValidator.check({
        body,
        fields: [],
      });

      if (haveBodyInvalidParams.isLeft()) {
        return badRequest(haveBodyInvalidParams.value);
      }

      const { id_user, phone_number, type } = body as CreateOrUpdateUserPhoneDTO;

      const result = await this.createOrUpdateUserPhoneUseCase.execute({
        id_user,
        phone_number,
        type,
      });

      if (result.isLeft()) {
        return badRequest(result.value);
      }

      return ok(result.value);
    } catch {
      return serverError();
    }
  }
}
