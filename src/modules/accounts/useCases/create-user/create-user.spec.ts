import faker from 'faker';

import { CreateUserDTO } from '@modules/accounts/dtos';
import { UserRepositoryInMemory } from '@modules/accounts/repositories/in-memory';
import { BcryptFacade } from '@shared/container/providers/hasher/implementations';
import {
  UserParamsValidator,
  BodyRequestValidator,
  USER_PARANS_VALIDATOR_ERRORS,
} from '@shared/container/providers/validator/implementations';
import {
  EmptyBodyError,
  InvalidParamError,
  MissingParamError,
} from '@shared/errors/validator';
import { badRequest, serverError } from '@shared/http';

import { CreaUserUserCase, CreateUserController } from '.';

let bcryptFacade: BcryptFacade;
let userParamsValidator: UserParamsValidator;
let userRepository: UserRepositoryInMemory;
let createUserUseCase: CreaUserUserCase;
let bodyRequestValidator: BodyRequestValidator;
let createUserController: CreateUserController;
let httpRequest: {
  body: CreateUserDTO;
};
describe('create user', () => {
  beforeEach(() => {
    httpRequest = {
      body: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.internet.userName(),
      },
    };

    bcryptFacade = new BcryptFacade(2);
    userParamsValidator = new UserParamsValidator();
    userRepository = new UserRepositoryInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    createUserUseCase = new CreaUserUserCase(
      userRepository,
      userParamsValidator,
      bcryptFacade,
    );
    createUserController = new CreateUserController(
      createUserUseCase,
      bodyRequestValidator,
    );
  });

  it('should create a new user', async () => {
    const httpResponse = await createUserController.handle(httpRequest);

    expect(httpResponse.body).toBeUndefined();
    expect(httpResponse.statusCode).toBe(201);

    const newUser = await userRepository.findByEmail(httpRequest.body.email);

    expect(newUser.isRight()).toBe(true);
  });

  it('should not accpet a empty body request', async () => {
    const httpResponse = await createUserController.handle({});

    expect(httpResponse).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not accpet a body request missing a requerid field', async () => {
    delete httpRequest.body.password;
    const httpResponse = await createUserController.handle(httpRequest);

    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')));
  });

  it('should not accpet a invalid email address', async () => {
    const httpResponse = await createUserController.handle({
      body: {
        ...httpRequest.body,
        email: 'invalid-email',
      },
    });

    expect(httpResponse).toEqual(
      badRequest(new InvalidParamError(USER_PARANS_VALIDATOR_ERRORS.email)),
    );
  });

  it('should not accpet a invalid name', async () => {
    const httpResponse = await createUserController.handle({
      body: {
        ...httpRequest.body,
        name: 'i',
      },
    });
    expect(httpResponse).toEqual(
      badRequest(new InvalidParamError(USER_PARANS_VALIDATOR_ERRORS.name)),
    );
  });

  it('should not accpet a invalid password', async () => {
    const httpResponse = await createUserController.handle({
      body: {
        ...httpRequest.body,
        password: '12345',
      },
    });

    expect(httpResponse).toEqual(
      badRequest(new InvalidParamError(USER_PARANS_VALIDATOR_ERRORS.password)),
    );
  });

  it('should returns a server error if createUserUseCase.execute() throws a error', async () => {
    jest.spyOn(createUserUseCase, 'execute').mockRejectedValue(new Error());

    const httpResponse = await createUserController.handle(httpRequest);

    expect(httpResponse).toEqual(serverError());
  });

  it('should CreaUserUserCase call your methods correctly', async () => {
    const user_mock = {
      email: faker.internet.email(),
      name: faker.internet.userName(),
      password: faker.internet.password(),
    };

    const checkSpy = jest.spyOn(userParamsValidator, 'check');
    const findByEmail = jest.spyOn(userRepository, 'findByEmail');
    const hashSpy = jest
      .spyOn(bcryptFacade, 'hash')
      .mockResolvedValueOnce('any_hash');
    const addSpy = jest.spyOn(userRepository, 'add');

    await createUserUseCase.execute(user_mock);

    expect(checkSpy).toBeCalledWith(user_mock);
    expect(findByEmail).toBeCalledWith(user_mock.email);
    expect(hashSpy).toBeCalledWith(user_mock.password);
    expect(addSpy).toBeCalledWith({
      ...user_mock,
      password: 'any_hash',
    });
  });

  it('should createUserController call your methods correctly', async () => {
    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(createUserUseCase, 'execute');
    await createUserController.handle(httpRequest);

    expect(checkSpy).toBeCalledWith({
      body: httpRequest.body,
      fields: ['name', 'email', 'password'],
    });

    expect(executeSpy).toBeCalledWith(httpRequest.body);
  });
});