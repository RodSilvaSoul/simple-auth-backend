import { IUserRepository } from '@modules/accounts/repositories';

export class CreateOrUpdateUserPhoneUseCase {
  constructor(
        private readonly userRepository:IUserRepository,
        private readonly userPhoneRepository:IUserPhoneRepository,
  ) {}
}
