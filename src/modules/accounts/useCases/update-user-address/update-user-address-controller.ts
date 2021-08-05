import { singleton, inject } from 'tsyringe';

import { UpdateUserAddressDTO } from '@modules/accounts/dtos';
import { IValidator } from '@shared/container/providers';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { UpdateUserAddressUseCase } from './update-user-address-useCase';

@singleton()
export class UpdateUserAddressController implements IController {
  constructor(
    @inject('UpdateUserAddressUseCase')
    private readonly updateUserAddressUseCase: UpdateUserAddressUseCase,
    @inject('BodyRequestValidator')
    private readonly validator: IValidator,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const haveBodyInvalidParams = this.validator.check({
        body,
        fields: ['id_user'],
      });

      if (haveBodyInvalidParams.isLeft()) {
        badRequest(haveBodyInvalidParams.value);
      }

      const {
        city, district, house_number, id_user, postal_code, state,
      } = body as UpdateUserAddressDTO;

      const result = await this.updateUserAddressUseCase.execute({
        city,
        district,
        house_number,
        id_user,
        postal_code,
        state,
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
