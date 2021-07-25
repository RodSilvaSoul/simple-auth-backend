import { Router } from 'express';
import { container } from 'tsyringe';

import {
  CreateUserController,
  ResetPasswordUserController,
  UserAuthenticateController,
  SendForgotPasswordEmailController,
  VerifyEmailController,
  SendVerifyEmailController,
} from '@modules/accounts/useCases';
import { expressRouterAdapter } from '@shared/adapters';

const createUserController = container.resolve(CreateUserController);
const userAuthenticateController = container.resolve(
  UserAuthenticateController,
);

const sendForgotPasswordEmailController = container.resolve(
  SendForgotPasswordEmailController,
);
const resetPasswordUserController = container.resolve(
  ResetPasswordUserController,
);
const verifyEmailController = container.resolve(VerifyEmailController);
const sendVerifyEmailController = container.resolve(SendVerifyEmailController);

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

  router.post(
    '/send-verify-email',
    expressRouterAdapter(sendVerifyEmailController),
  );

  router.post('/verify-email', expressRouterAdapter(verifyEmailController));
};
