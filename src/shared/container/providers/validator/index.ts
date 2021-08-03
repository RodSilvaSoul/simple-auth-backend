import { container } from 'tsyringe';

import {
  BodyRequestValidator,
  UserParamsValidator,
  CreateUserAddressParamsValidator,
} from './implementations/index';
import { IValidator } from './IValidator';

export * from './IValidator';

container.registerSingleton<IValidator>(
  'BodyRequestValidator',
  BodyRequestValidator,
);

container.registerSingleton<IValidator>(
  'UserParamsValidator',
  UserParamsValidator,
);

container.registerSingleton<IValidator>(
  'CreateUserAddressParamsValidator',
  CreateUserAddressParamsValidator,
);
