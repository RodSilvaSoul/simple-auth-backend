import { Router } from 'express';
import { container } from 'tsyringe';

import {
  CreateUserController,
  ResetPasswordUserController,
  UserAuthenticateController,
  SendForgotPasswordEmailController,
  VerifyEmailController,
  SendVerifyEmailController,
  CreateUserAddressController,
  CreateUserPhoneController,
  UpdateUserAddressController,
  UpdateUserPhoneController,
} from '@modules/accounts/useCases';
import {
  expressMiddlewareAdapter,
  expressRouterAdapter,
} from '@shared/adapters';
import { AuthMiddleware } from '@shared/middlers';

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

const createUserAddressController = container.resolve(
  CreateUserAddressController,
);

const updateUserAddressController = container.resolve(
  UpdateUserAddressController,
);

const createUserPhoneController = container.resolve(CreateUserPhoneController);
const updateUserPhoneController = container.resolve(UpdateUserPhoneController);

const authMiddleware = container.resolve(AuthMiddleware);

const expressAuthMiddleware = expressMiddlewareAdapter(authMiddleware);

export default (router: Router) => {
  router.post('/sign', expressRouterAdapter(createUserController));
  router.post('/login', expressRouterAdapter(userAuthenticateController));

  router.post(
    '/password/forgot',
    expressAuthMiddleware,
    expressRouterAdapter(sendForgotPasswordEmailController),
  );

  router.post(
    '/password/reset',
    expressAuthMiddleware,
    expressRouterAdapter(resetPasswordUserController),
  );

  router.post(
    '/send-verify-email',
    expressAuthMiddleware,
    expressRouterAdapter(sendVerifyEmailController),
  );

  router.post(
    '/verify-email',
    expressAuthMiddleware,
    expressRouterAdapter(verifyEmailController),
  );

  router.post(
    '/user/address/create',
    expressAuthMiddleware,
    expressRouterAdapter(createUserAddressController),
  );

  router.put(
    '/user/address/update',
    expressAuthMiddleware,
    expressRouterAdapter(updateUserAddressController),
  );

  router.post(
    '/user/phone/create',
    expressAuthMiddleware,
    expressRouterAdapter(createUserPhoneController),
  );

  router.put(
    '/user/phone/update',
    expressAuthMiddleware,
    expressRouterAdapter(updateUserPhoneController),
  );
};
