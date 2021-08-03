import { verify } from 'jsonwebtoken';

import auth from '@config/auth';
import {
  HttpRequest, HttpResponse, ok, unauthorized,
} from '@shared/http';
import { IMiddleware } from '@shared/ports/middleware';

export class AuthMiddleware implements IMiddleware {
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const authHeader = req.headers.authorization as string;

    if (!authHeader) {
      return unauthorized({
        error: 'token missing',
      });
    }

    try {
      const [, token] = authHeader.split(' ');

      const { sub: id_user } = verify(token, auth.secret_token);

      req.user = {
        id_user,
      };

      return ok();
    } catch {
      return unauthorized({ error: 'token invalid' });
    }
  }
}