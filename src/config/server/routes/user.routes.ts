import { Router } from 'express';
import { container } from 'tsyringe';

import { CreateUserController } from '@modules/accounts/useCases';
import { expressRouterAdapter } from '@shared/adapters';

const userRoutes = Router();

const creteUserController = container.resolve(CreateUserController);

userRoutes.post('/', expressRouterAdapter(creteUserController));

export { userRoutes };
