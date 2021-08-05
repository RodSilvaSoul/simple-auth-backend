import { inject, singleton } from 'tsyringe';

import { CreateUserAddressDTO } from '@modules/accounts/dtos';
import { IValidator } from '@shared/container/providers';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
} from '@shared/http';
import { IController } from '@shared/ports';

import { CreateUserAddressUseCase } from './create-user-address-useCase';

@singleton()
export class CreateUserAddressController implements IController {
  constructor(
    @inject('CreateUserAddressUseCase')
    private readonly createUserAddressUseCase: CreateUserAddressUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const haveBodyInvalidParams = this.bodyRequestValidator.check({
        body,
        fields: [
          'city',
          'state',
          'house_number',
          'id_user',
          'postal_code',
          'district',
        ],
      });

      if (haveBodyInvalidParams.isLeft()) {
        return badRequest(haveBodyInvalidParams.value);
      }

      const {
        city, district, house_number, id_user, postal_code, state,
      } = body as CreateUserAddressDTO;

      const result = await this.createUserAddressUseCase.execute({
        city,
        district,
        state,
        house_number,
        id_user,
        postal_code,
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
