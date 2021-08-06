import { inject, singleton } from 'tsyringe';

import { MissingParamError } from '@shared/errors/validator';
import {
  badRequest,
  HttpRequest,
  HttpResponse,
  ok,
  serverError,
  unauthorized,
} from '@shared/http';
import { IController } from '@shared/ports';

import { RefreshTokeUseCase } from './refresh-token-useCase';

@singleton()
export class RefreshTokenController implements IController {
  constructor(
    @inject('RefreshTokeUseCase')
    private readonly refreshTokenUseCase: RefreshTokeUseCase,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const token = request.body.token
        || request.query.token
        || request.headers['x-access-token'];

      if (!token) {
        return badRequest(new MissingParamError('Missing token'));
      }

      const result = await this.refreshTokenUseCase.execute(token);

      if (result.isLeft()) {
        return unauthorized(result.value);
      }

      return ok(result.value);
    } catch (error) {
      return serverError();
    }
  }
}
