import { container } from 'tsyringe';

import './providers';
import {
  TokenRepository,
  UserRepository,
} from '@modules/accounts/infra/typorm/repositories';
import {
  ITokenRepository,
  IUserRepository,
} from '@modules/accounts/repositories';
import {
  UserAuthenticateUseCase,
  CreaUserUserCase,
  ResetPasswordUserUseCase,
  SendForgotPasswordEmailUseCase,
  SendVerifyEmailUseCase,
  VerifyEmailUseCase,
} from '@modules/accounts/useCases';

container.registerSingleton<ITokenRepository>(
  'TokenRepository',
  TokenRepository,
);

container.registerSingleton<IUserRepository>('UserRepository', UserRepository);

container.registerSingleton<UserAuthenticateUseCase>(
  'UserAuthenticateUseCase',
  UserAuthenticateUseCase,
);

container.registerSingleton<CreaUserUserCase>(
  'CreaUserUserCase',
  CreaUserUserCase,
);

container.registerSingleton<ResetPasswordUserUseCase>(
  'ResetPasswordUserUseCase',
  ResetPasswordUserUseCase,
);

container.registerSingleton<SendForgotPasswordEmailUseCase>(
  'SendForgotPasswordEmailUseCase',
  SendForgotPasswordEmailUseCase,
);

container.registerSingleton<SendVerifyEmailUseCase>(
  'SendVerifyEmailUseCase',
  SendVerifyEmailUseCase,
);

container.registerSingleton<VerifyEmailUseCase>(
  'VerifyEmailUseCase',
  VerifyEmailUseCase,
);
