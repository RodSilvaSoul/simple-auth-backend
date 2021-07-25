import { Router } from 'express';
import { container } from 'tsyringe';

import {
  CreateUserController,
  ResetPasswordUserController,
  UserAuthenticateController,
  SendForgotPasswordEmailController,
} from '@modules/accounts/useCases';
import { expressRouterAdapter } from '@shared/adapters';

const createUserController = container.resolve(CreateUserController);
const userAuthenticateController = container.resolve(
  UserAuthenticateController,
);

const sendForgotPasswordEmailController = container.resolve(SendForgotPasswordEmailController);
const resetPasswordUserController = container.resolve(ResetPasswordUserController);

export default (router: Router) => {
  router.post('/sign', expressRouterAdapter(createUserController));
  router.post('/login', expressRouterAdapter(userAuthenticateController));
  router.post(
    '/password/forgot',
    expressRouterAdapter(sendForgotPasswordEmailController),
  );
  router.post(
    '/password/reset',
    expressRouterAdapter(resetPasswordUserController),
  );
};
