import faker from 'faker';

import { CreateUserAddressDTO, CreateUserDTO } from '@modules/accounts/dtos';
import {
  UserAddressInMemoryRepository,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import {
  BodyRequestValidator,
  CreateUserAddressParamsValidator,
} from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import {
  EmptyBodyError,
  InvalidParamError,
  MissingParamError,
} from '@shared/errors/validator';
import { badRequest } from '@shared/http';
import { left, right } from '@shared/utils';

import { CreateUserAddressController } from './create-user-address-controller';
import { CreateUserAddressUseCase } from './create-user-address-useCase';
import { UserAlreadyHaveAddress } from './errors';

let createUserAddressUseCase: CreateUserAddressUseCase;
let createUserAddressController: CreateUserAddressController;
let userAddressRepository: UserAddressInMemoryRepository;
let userRepository: UserRepositoryInMemory;
let bodyRequestValidator: BodyRequestValidator;
let createUserAddressParamsValidator: CreateUserAddressParamsValidator;

const userAddressMock: CreateUserAddressDTO = {
  city: 'any_city',
  state: 'any_state',
  district: 'any_district',
  house_number: 1,
  id_user: faker.datatype.uuid(),
  postal_code: 'any_postal_code',
};

const user_mock: CreateUserDTO = {
  id: faker.datatype.uuid(),
  email: 'any_email',
  name: 'any_name',
  password: 'any_password',
};
describe('Create or update user address', () => {
  beforeEach(() => {
    userAddressRepository = new UserAddressInMemoryRepository();
    userRepository = new UserRepositoryInMemory();

    createUserAddressParamsValidator = new CreateUserAddressParamsValidator();
    createUserAddressUseCase = new CreateUserAddressUseCase(
      userAddressRepository,
      userRepository,
      createUserAddressParamsValidator,
    );
    bodyRequestValidator = new BodyRequestValidator();
    createUserAddressController = new CreateUserAddressController(
      createUserAddressUseCase,
      bodyRequestValidator,
    );
  });
  it('should createUserAddressUseCase call your methods correctly', async () => {
    const findByIdSpy = jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));

    const saveSpy = jest.spyOn(userAddressRepository, 'save');
    const checkSpy = jest.spyOn(createUserAddressParamsValidator, 'check');
    const findByUserIdSpy = jest
      .spyOn(userAddressRepository, 'findByUserId')
      .mockResolvedValueOnce(left(new Error()));

    await createUserAddressUseCase.execute(userAddressMock);

    expect(checkSpy).toBeCalledWith(userAddressMock);
    expect(findByIdSpy).toBeCalledWith(userAddressMock.id_user);
    expect(findByUserIdSpy).toBeCalledWith(userAddressMock.id_user);
    expect(saveSpy).toBeCalledWith(userAddressMock);
  });

  it('should createUserAddressController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(createUserAddressUseCase, 'execute');

    const http_request = {
      body: userAddressMock,
    };

    await createUserAddressController.handle(http_request);

    expect(checkSpy).toBeCalledWith({
      body: http_request.body,
      fields: [
        'city',
        'state',
        'house_number',
        'id_user',
        'postal_code',
        'district',
      ],
    });

    expect(executeSpy).toBeCalledWith(userAddressMock);
  });

  it('should create a new user address for a registered user', async () => {
    jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));

    jest
      .spyOn(userAddressRepository, 'findByUserId')
      .mockResolvedValueOnce(left(new Error()));

    const http_request = {
      body: userAddressMock,
    };

    const http_response = await createUserAddressController.handle(
      http_request,
    );

    expect(http_response.statusCode).toEqual(200);
    expect(http_response.body).toEqual(userAddressMock);
  });

  it('should not accept a empty body request', async () => {
    const http_response = await createUserAddressController.handle({});

    expect(http_response).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not create a new user address for a not registered user', async () => {
    const http_request = {
      body: userAddressMock,
    };

    const http_response = await createUserAddressController.handle(
      http_request,
    );

    expect(http_response).toEqual(badRequest(new UserNotFoundError()));
  });

  it('should not accept a body request missing required params', async () => {
    const invalid_Body = {
      city: 'any_city',
      state: 'any_state',
      district: 'any_district',
      house_number: 1,
    };

    const http_response = await createUserAddressController.handle({
      body: invalid_Body,
    });

    expect(http_response).toEqual(
      badRequest(
        new MissingParamError(
          'The filed(s): [id_user,postal_code] is missing.',
        ),
      ),
    );
  });

  it('should not create a user address if the user already have one', async () => {
    jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValueOnce(right(user_mock as any));

    jest
      .spyOn(userAddressRepository, 'findByUserId')
      .mockResolvedValueOnce(right({} as any));

    const http_request = {
      body: userAddressMock,
    };

    const http_response = await createUserAddressController.handle(
      http_request,
    );

    expect(http_response).toEqual(badRequest(new UserAlreadyHaveAddress()));
  });

  it('should not accept a empty string ', async () => {
    const invalid_Body = {
      city: 'any_city',
      state: 'any_state',
      district: '',
      house_number: 1,
      id_user: 'any_id_user',
      postal_code: 'any_postal_code',
    };

    const http_response = await createUserAddressController.handle({
      body: invalid_Body,
    });

    expect(http_response).toEqual(
      badRequest(new MissingParamError('The filed(s): [district] is missing.')),
    );
  });

  it('should not accept a invalid postal_code', async () => {
    const invalid_Body = {
      ...userAddressMock,
      postal_code: 'any',
    };

    const http_response = await createUserAddressController.handle({
      body: invalid_Body,
    });

    expect(http_response).toEqual(
      badRequest(
        new InvalidParamError('The param postal_code sent is not valid'),
      ),
    );
  });

  it('should not accept a id_user with a invalid uuid format ', async () => {
    const invalid_Body = {
      ...userAddressMock,
      id_user: 'any',
    };

    const http_response = await createUserAddressController.handle({ body: invalid_Body });

    expect(http_response).toEqual(
      badRequest(
        new InvalidParamError('The id_user does not have a valid uuid format'),
      ),
    );
  });
});