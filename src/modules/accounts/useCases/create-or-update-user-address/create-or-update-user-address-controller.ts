import { inject, singleton } from 'tsyringe';

import { CreateOrUpdateUserAddressDTO } from '@modules/accounts/dtos';
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
export class CreateOrUpdateUserAddressController implements IController {
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
        fields: [],
      });

      if (haveBodyInvalidParams.isLeft()) {
        return badRequest(haveBodyInvalidParams.value);
      }

      const {
        city, district, house_number, id_user, postal_code,
      } = body as CreateOrUpdateUserAddressDTO;

      const result = await this.createOrUpdateUserAddressUseCase.execute({
        city,
        district,
        house_number,
        id_user,
        postal_code,
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
