import { container } from 'tsyringe';

import { BodyRequestValidator } from './implementations/body-request-validator';
import { UserParamsValidator } from './implementations/user-params-validator';
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
