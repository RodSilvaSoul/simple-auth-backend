import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import { IJwtProvider } from '../IJwt-provider';

@injectable()
export class JwtFacade implements IJwtProvider {
  async createToken(
    payload: any,
    expiresIn: string | number,
    secret: string,
    subject: string,
  ): Promise<string> {
    const token = jwt.sign(payload, secret, {
      expiresIn,
      subject,
    });

    return token;
  }
  async verify(token: string, secret: string): Promise<boolean> {
    try {
      jwt.verify(token, secret);
      return true;
    } catch {
      return false;
    }
  }
}
