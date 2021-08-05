import { CreateUserPhoneDTO } from '@modules/accounts/dtos';
import {
  UserPhoneInMemory,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import {
  BodyRequestValidator,
  CreateUserPhoneParamsValidator,
} from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import { EmptyBodyError } from '@shared/errors/validator';
import { badRequest } from '@shared/http';
import { right } from '@shared/utils';

import { CreateUserPhoneController, CreateUserPhoneUseCase } from '.';
import { UserAlreadyHavePhone } from './errors';

let createUserPhoneController: CreateUserPhoneController;
let createUserPhoneUseCase: CreateUserPhoneUseCase;
let bodyRequestValidator: BodyRequestValidator;
let userRepository: UserRepositoryInMemory;
let userPhoneRepository: UserPhoneInMemory;
let createUserPhoneParamsValidator: CreateUserPhoneParamsValidator;

const user_mock = {
  id: 'any_id',
  email: 'user@example.com',
  password: 'any_password',
};

const user_phone_mock: CreateUserPhoneDTO = {
  id_user: 'any_id',
  phone_number: 'any_phone_number',
  type: 'any_type',
};

describe('create or update user phone use case', () => {
  beforeEach(() => {
    userRepository = new UserRepositoryInMemory();
    userPhoneRepository = new UserPhoneInMemory();
    bodyRequestValidator = new BodyRequestValidator();

    createUserPhoneParamsValidator = new CreateUserPhoneParamsValidator();

    createUserPhoneUseCase = new CreateUserPhoneUseCase(
      userRepository,
      userPhoneRepository,
      createUserPhoneParamsValidator,
    );

    createUserPhoneController = new CreateUserPhoneController(
      createUserPhoneUseCase,
      bodyRequestValidator,
    );
  });

  it('should createUserPhoneUseCase call your methods correctly', async () => {
    const findByIdSpy = jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));
    const createOrUpdateSpy = jest.spyOn(userPhoneRepository, 'save');
    const checkSpy = jest.spyOn(createUserPhoneParamsValidator, 'check');
    const findByUserIdSpy = jest.spyOn(userPhoneRepository, 'findByUserId');

    await createUserPhoneUseCase.execute(user_phone_mock);

    expect(findByIdSpy).toBeCalledWith('any_id');
    expect(createOrUpdateSpy).toBeCalledWith(user_phone_mock);
    expect(checkSpy).toBeCalledWith(user_phone_mock);
    expect(findByUserIdSpy).toBeCalledWith('any_id');
  });

  it('should createUserPhoneController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(createUserPhoneUseCase, 'execute');

    const http_request = {
      body: user_phone_mock,
    };

    await createUserPhoneController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: user_phone_mock,
      fields: ['id_user', 'type', 'phone_number'],
    });
    expect(executeSpy).toBeCalledWith(user_phone_mock);
  });

  it('should create a new user phone for a registered user', async () => {
    const http_request = {
      body: user_phone_mock,
    };

    jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));

    const http_response = await createUserPhoneController.handle(http_request);

    expect(http_response.statusCode).toBe(200);
    expect(http_response.body).toEqual(user_phone_mock);
  });

  it('should should not accept a empty body request', async () => {
    const http_response = await createUserPhoneController.handle({});

    expect(http_response).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not create a new user phone for a not registered user', async () => {
    const http_request = {
      body: user_phone_mock,
    };
    const http_response = await createUserPhoneController.handle(http_request);

    expect(http_response).toEqual(badRequest(new UserNotFoundError()));
  });

  it('should not create a user phone if the user already have one', async () => {
    jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));
    jest
      .spyOn(userPhoneRepository, 'findByUserId')
      .mockResolvedValueOnce(right({} as any));

    const http_request = {
      body: user_phone_mock,
    };

    const http_response = await createUserPhoneController.handle(http_request);

    expect(http_response).toEqual(badRequest(new UserAlreadyHavePhone()));
  });
});
