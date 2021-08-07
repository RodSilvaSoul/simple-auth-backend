import { Router } from 'express';
import { container } from 'tsyringe';

import {
  CreateUserController,
  VerifyEmailController,
} from '@modules/accounts/useCases';
import {
  expressMiddlewareAdapter,
  expressRouterAdapter,
} from '@shared/adapters';
import { AuthMiddleware } from '@shared/middlers';

const userRoutes = Router();

const creteUserController = expressRouterAdapter(
  container.resolve(CreateUserController),
);
const verifyEmailController = expressRouterAdapter(
  container.resolve(VerifyEmailController),
);

const authMiddleware = expressMiddlewareAdapter(new AuthMiddleware());

userRoutes.post('/', creteUserController);
userRoutes.post('/verify-email', authMiddleware, verifyEmailController);

export { userRoutes };
