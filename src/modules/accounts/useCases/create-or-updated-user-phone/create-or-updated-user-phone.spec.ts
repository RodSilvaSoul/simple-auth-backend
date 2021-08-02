import { CreateOrUpdateUserPhoneDTO } from '@modules/accounts/dtos';
import {
  UserPhoneInMemory,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { BodyRequestValidator } from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import { EmptyBodyError } from '@shared/errors/validator';
import { badRequest } from '@shared/http';
import { right } from '@shared/utils';

import {
  CreateOrUpdateUserPhoneController,
  CreateOrUpdateUserPhoneUseCase,
} from '.';

let createOrUpdateUserPhoneController: CreateOrUpdateUserPhoneController;
let createOrUpdateUserPhoneUseCase: CreateOrUpdateUserPhoneUseCase;
let bodyRequestValidator: BodyRequestValidator;
let userRepository: UserRepositoryInMemory;
let userPhoneRepository: UserPhoneInMemory;

const user_mock = {
  id: 'any_id',
  email: 'user@example.com',
  password: 'any_password',
};

const user_phone_mock: CreateOrUpdateUserPhoneDTO = {
  id_user: 'any_id',
  phone_number: 'any_phone_number',
  type: 'any_type',
};

describe('create or update user phone use case', () => {
  beforeEach(() => {
    userRepository = new UserRepositoryInMemory();
    userPhoneRepository = new UserPhoneInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    createOrUpdateUserPhoneUseCase = new CreateOrUpdateUserPhoneUseCase(
      userRepository,
      userPhoneRepository,
    );

    createOrUpdateUserPhoneController = new CreateOrUpdateUserPhoneController(
      createOrUpdateUserPhoneUseCase,
      bodyRequestValidator,
    );
  });

  it('should createOrUpdateUserPhoneUseCase call your methods correctly', async () => {
    const findByIdSpy = jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));
    const createOrUpdateSpy = jest.spyOn(userPhoneRepository, 'createOrUpdate');

    await createOrUpdateUserPhoneUseCase.execute(user_phone_mock);

    expect(findByIdSpy).toBeCalledWith('any_id');

    expect(createOrUpdateSpy).toBeCalledWith(user_phone_mock);
  });

  it('should createOrUpdateUserPhoneController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(createOrUpdateUserPhoneUseCase, 'execute');

    const http_request = {
      body: user_phone_mock,
    };

    await createOrUpdateUserPhoneController.handle(http_request);

    expect(checkSpy).toBeCalledWith({ body: user_phone_mock, fields: [] });
    expect(executeSpy).toBeCalledWith(user_phone_mock);
  });

  it('should create a new user phone for a registered user', async () => {
    const http_request = {
      body: user_phone_mock,
    };

    jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));

    const http_response = await createOrUpdateUserPhoneController.handle(
      http_request,
    );

    expect(http_response.statusCode).toBe(200);
    expect(http_response.body).toEqual(
      expect.objectContaining(user_phone_mock),
    );
  });

  it('should should not accept a empty body request', async () => {
    const http_response = await createOrUpdateUserPhoneController.handle({});

    expect(http_response).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not create a new user phone for a not registered user', async () => {
    const http_request = {
      body: user_phone_mock,
    };
    const http_response = await createOrUpdateUserPhoneController.handle(
      http_request,
    );

    expect(http_response).toEqual(badRequest(new UserNotFoundError()));
  });
});
