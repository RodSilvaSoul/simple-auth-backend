import { Router } from 'express';
import { container } from 'tsyringe';

import {
  CreateUserPhoneController,
  UpdateUserPhoneController,
} from '@modules/accounts/useCases';
import {
  expressMiddlewareAdapter,
  expressRouterAdapter,
} from '@shared/adapters';
import { AuthMiddleware } from '@shared/middlers';

const phoneRoutes = Router();

const authenticateMiddleware = expressMiddlewareAdapter(
  container.resolve(AuthMiddleware),
);

const createUserPhoneController = expressRouterAdapter(
  container.resolve(CreateUserPhoneController),
);

const updateUserPhoneController = expressRouterAdapter(
  container.resolve(UpdateUserPhoneController),
);

phoneRoutes.post('/create', authenticateMiddleware, createUserPhoneController);
phoneRoutes.put('/update', authenticateMiddleware, updateUserPhoneController);

export { phoneRoutes };
