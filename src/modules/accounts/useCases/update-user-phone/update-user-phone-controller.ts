import { inject, singleton } from 'tsyringe';

import { UpdateUserPhoneDTO } from '@modules/accounts/dtos';
import { IValidator } from '@shared/container/providers';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { UpdateUserPhoneUseCase } from './update-user-phone-useCase';

@singleton()
export class UpdateUserPhoneController implements IController {
  constructor(
    @inject('UpdateUserPhoneUseCase')
    private readonly updateUserPhoneUseCase: UpdateUserPhoneUseCase,
    @inject('BodyRequestValidator')
    private readonly validator: IValidator,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const isBodyInvalid = this.validator.check({
        body,
        fields: ['id_user'],
      });

      if (isBodyInvalid.isLeft()) {
        return badRequest(isBodyInvalid.value);
      }

      const { id_user, phone_number, type } = body as UpdateUserPhoneDTO;

      const result = await this.updateUserPhoneUseCase.execute({
        id_user,
        phone_number,
        type,
      });

      if (result.isLeft()) {
        return badRequest(result.value);
      }

      return ok({
        message: 'Updated successfully',
        data: {
          ...result.value,
        },
      });
    } catch (error) {
      return serverError();
    }
  }
}
