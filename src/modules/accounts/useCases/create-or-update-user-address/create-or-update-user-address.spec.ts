import {
  CreateOrUpdateUserAddressDTO,
  CreateUserDTO,
} from '@modules/accounts/dtos';
import {
  UserAddressInMemoryRepository,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { BodyRequestValidator } from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import { EmptyBodyError } from '@shared/errors/validator';
import { badRequest } from '@shared/http';
import { right } from '@shared/utils';

import { CreateOrUpdateUserAddressController } from './create-or-update-user-address-controller';
import { CreateOrUpdateUserAddressUseCase } from './create-or-update-user-address-useCase';

let createOrUpdateUserAddressUseCase: CreateOrUpdateUserAddressUseCase;
let createOrUpdateUserAddressController: CreateOrUpdateUserAddressController;
let userAddressRepository: UserAddressInMemoryRepository;
let userRepository: UserRepositoryInMemory;
let bodyRequestValidator: BodyRequestValidator;

const userAddressMock: CreateOrUpdateUserAddressDTO = {
  city: 'any_city',
  district: 'any_district',
  house_number: 1,
  id_user: 'any_id_user',
  postal_code: 'any_postal_code',
};

const user_mock: CreateUserDTO = {
  id: 'any_id_user',
  email: 'any_email',
  name: 'any_name',
  password: 'any_password',
};
describe('Create or update user address', () => {
  beforeEach(() => {
    userAddressRepository = new UserAddressInMemoryRepository();
    userRepository = new UserRepositoryInMemory();
    createOrUpdateUserAddressUseCase = new CreateOrUpdateUserAddressUseCase(
      userAddressRepository,
      userRepository,
    );
    bodyRequestValidator = new BodyRequestValidator();
    createOrUpdateUserAddressController = new CreateOrUpdateUserAddressController(
      createOrUpdateUserAddressUseCase,
      bodyRequestValidator,
    );
  });
  it('should createOrUpdateUserAddressUseCase call your methods correctly', async () => {
    const findByIdSpy = jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));

    const createOrUpdateSpy = jest.spyOn(
      userAddressRepository,
      'createOrUpdate',
    );

    await createOrUpdateUserAddressUseCase.execute(userAddressMock);

    expect(findByIdSpy).toBeCalledWith('any_id_user');
    expect(createOrUpdateSpy).toBeCalledWith(userAddressMock);
  });

  it('should createOrUpdateUserAddressController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(createOrUpdateUserAddressUseCase, 'execute');

    const http_request = {
      body: userAddressMock,
    };

    await createOrUpdateUserAddressController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: http_request.body,
      fields: [],
    });

    expect(executeSpy).toBeCalledWith(userAddressMock);
  });

  it('should create a new user address for a registered user', async () => {
    jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));

    const http_request = {
      body: userAddressMock,
    };

    const http_response = await createOrUpdateUserAddressController.handle(
      http_request,
    );

    expect(http_response.statusCode).toEqual(200);
    expect(http_response.body).toEqual(
      expect.objectContaining(userAddressMock),
    );
  });

  it('should not accept a empty body request', async () => {
    const http_response = await createOrUpdateUserAddressController.handle({});

    expect(http_response).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not create a new user address for a not registered user', async () => {
    const http_request = {
      body: userAddressMock,
    };

    const http_response = await createOrUpdateUserAddressController.handle(
      http_request,
    );

    expect(http_response).toEqual(badRequest(new UserNotFoundError()));
  });
});
