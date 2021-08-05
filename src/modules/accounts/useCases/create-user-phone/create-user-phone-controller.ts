import { inject, singleton } from 'tsyringe';

import { CreateUserPhoneDTO } from '@modules/accounts/dtos';
import { IValidator } from '@shared/container/providers';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { CreateUserPhoneUseCase } from './create-user-phone-useCase';

@singleton()
export class CreateUserPhoneController implements IController {
  constructor(
    @inject('CreateUserPhoneUseCase')
    private readonly createUserPhoneUseCase: CreateUserPhoneUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const haveBodyInvalidParams = this.bodyRequestValidator.check({
        body,
        fields: ['id_user', 'type', 'phone_number'],
      });

      if (haveBodyInvalidParams.isLeft()) {
        return badRequest(haveBodyInvalidParams.value);
      }

      const { id_user, phone_number, type } = body as CreateUserPhoneDTO;

      const result = await this.createUserPhoneUseCase.execute({
        id_user,
        phone_number,
        type,
      });

      if (result.isLeft()) {
        return badRequest(result.value);
      }

      return ok(result.value);
    } catch (error) {
      return serverError();
    }
  }
}
