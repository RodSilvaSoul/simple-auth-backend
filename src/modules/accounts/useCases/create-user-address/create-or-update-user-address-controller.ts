import { inject, singleton } from 'tsyringe';

import { CreateUserAddressDTO } from '@modules/accounts/dtos';
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

import { CreateOrUpdateUserAddressUseCase } from './create-or-update-user-address-useCase';

@singleton()
class CreateOrUpdateUserAddressController implements IController {
  constructor(
    @inject('CreateOrUpdateUserAddressUseCase')
    private readonly createOrUpdateUserAddressUseCase: CreateOrUpdateUserAddressUseCase,
    @inject('BodyRequestValidator')
    private readonly bodyRequestValidator: IValidator<BodyRequestValidatorParams>,
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      const haveBodyInvalidParams = this.bodyRequestValidator.check({
        body,
        fields: ['city', 'state', 'house_number', 'id_user', 'postal_code'],
      });

      if (haveBodyInvalidParams.isLeft()) {
        return badRequest(haveBodyInvalidParams.value);
      }

      const {
        city, district, house_number, id_user, postal_code, state,
      } = body as CreateUserAddressDTO;

      const result = await this.createOrUpdateUserAddressUseCase.execute({
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

export { CreateOrUpdateUserAddressController };
