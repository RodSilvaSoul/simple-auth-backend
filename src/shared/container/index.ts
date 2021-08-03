import { container } from 'tsyringe';

import './providers';

import {
  TokenRepository,
  UserRepository,
  UserAddressRepository,
  UserPhoneRepository,
} from '@modules/accounts/infra/typorm/repositories';
import {
  ITokenRepository,
  IUserRepository,
  IUserAddressRepository,
  IUserPhoneRepository,
} from '@modules/accounts/repositories';
import {
  UserAuthenticateUseCase,
  CreatUserUserCase,
  ResetPasswordUserUseCase,
  SendForgotPasswordEmailUseCase,
  SendVerifyEmailUseCase,
  VerifyEmailUseCase,
  CreateOrUpdateUserAddressUseCase,
  CreateOrUpdateUserPhoneUseCase,
} from '@modules/accounts/useCases';
import { IMiddleware } from '@shared/ports/middleware';

import { AuthMiddleware } from '../middlers';

container.registerSingleton<ITokenRepository>(
  'TokenRepository',
  TokenRepository,
);

container.registerSingleton<IUserRepository>('UserRepository', UserRepository);

container.registerSingleton<IUserAddressRepository>(
  'UserAddressRepository',
  UserAddressRepository,
);

container.registerSingleton<IUserPhoneRepository>(
  'UserPhoneRepository',
  UserPhoneRepository,
);

container.registerSingleton<CreateOrUpdateUserAddressUseCase>(
  'CreateOrUpdateUserAddressUseCase',
  CreateOrUpdateUserAddressUseCase,
);

container.registerSingleton<CreateOrUpdateUserPhoneUseCase>(
  'CreateOrUpdateUserPhoneUseCase',
  CreateOrUpdateUserPhoneUseCase,
);

container.registerSingleton<UserAuthenticateUseCase>(
  'UserAuthenticateUseCase',
  UserAuthenticateUseCase,
);

container.registerSingleton<CreatUserUserCase>(
  'CreatUserUserCase',
  CreatUserUserCase,
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

container.registerSingleton<IMiddleware>('AuthMiddleware', AuthMiddleware);
