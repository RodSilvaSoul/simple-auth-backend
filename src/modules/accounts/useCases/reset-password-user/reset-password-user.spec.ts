import faker from 'faker';

import {
  UserRepositoryInMemory,
  TokenRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { BcryptFacade } from '@shared/container/providers/hasher/implementations';
import { BodyRequestValidator } from '@shared/container/providers/validator/implementations';
import { InvalidTokenError } from '@shared/errors/useCase';
import { serverError, unauthorized } from '@shared/http';

import { ResetPasswordUserController } from './reset-password-user-controller';
import { ResetPasswordUserUseCase } from './reset-password-user-useCase';

let resetPasswordUserUseCase: ResetPasswordUserUseCase;
let resetPasswordUserController: ResetPasswordUserController;
let bodyRequestValidator: BodyRequestValidator;
let userRepository: UserRepositoryInMemory;
let bcryptFacade: BcryptFacade;
let dayjsFacade: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;

describe('Reset password user', () => {
  beforeEach(() => {
    bcryptFacade = new BcryptFacade(2);
    dayjsFacade = new DayjsFacade();
    tokenRepository = new TokenRepositoryInMemory();
    userRepository = new UserRepositoryInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    resetPasswordUserUseCase = new ResetPasswordUserUseCase(
      userRepository,
      tokenRepository,
      dayjsFacade,
      bcryptFacade,
    );

    resetPasswordUserController = new ResetPasswordUserController(
      resetPasswordUserUseCase,
      bodyRequestValidator,
    );
  });

  it('should reset a password user if the reset password token is valid', async () => {
    const token = faker.datatype.uuid();
    const id_user = faker.datatype.uuid();

    await tokenRepository.add({
      token,
      expires_in: faker.date.future(),
      id_user,
    });

    const old_password = faker.internet.password();

    userRepository.users.push({
      id: id_user,
      avatar_url: 'any_url',
      created_at: faker.date.soon(),
      email: faker.internet.email(),
      name: faker.internet.userName(),
      password: old_password,
      isVerified: true,
    });

    const request_body = {
      body: {
        password: faker.internet.password(),
      },
      query: {
        token,
      },
    };

    const httpResponse = await resetPasswordUserController.handle(request_body);

    expect(httpResponse.statusCode).toBe(200);

    const user = userRepository.users.find((user) => user.id === id_user);

    expect(user).toBeTruthy();
    expect(user.password).not.toBe(old_password);

    const shouldBeDeleted = await tokenRepository.findByUserId(id_user);

    expect(shouldBeDeleted.isLeft()).toBe(true);
  });

  it('should not accept a token that is not registered', async () => {
    const request_body = {
      body: {
        password: faker.internet.password(),
      },
      query: {
        token: faker.datatype.uuid(),
      },
    };

    const httpResponse = await resetPasswordUserController.handle(request_body);

    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should not accept a token that is expired', async () => {
    const token = faker.datatype.uuid();

    await tokenRepository.add({
      token,
      expires_in: faker.date.past(),
      id_user: faker.datatype.uuid(),
    });

    const request_body = {
      body: {
        password: faker.internet.password(),
      },
      query: {
        token,
      },
    };

    const httpResponse = await resetPasswordUserController.handle(request_body);

    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should returns a server error if resetPasswordUserUseCase.execute() throws an error', async () => {
    const request_body = {
      body: {
        password: faker.internet.password(),
      },
      query: {
        token: faker.datatype.uuid(),
      },
    };

    jest
      .spyOn(resetPasswordUserUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await resetPasswordUserController.handle(request_body);

    expect(httpResponse).toEqual(serverError());
  });

  it('should resetPasswordUserUseCase call your methods correctly ', async () => {
    const token = faker.datatype.uuid();
    const id_user = faker.datatype.uuid();
    const password = faker.internet.password();
    const expires_in = faker.date.future();
    const recent_date = faker.date.recent();

    await tokenRepository.add({
      token,
      expires_in,
      id_user,
    });

    userRepository.users.push({
      id: id_user,
      avatar_url: 'any_url',
      created_at: faker.date.soon(),
      email: faker.internet.email(),
      name: faker.internet.userName(),
      password: faker.internet.password(),
      isVerified: true,
    });

    const findBytokenSpy = jest.spyOn(tokenRepository, 'findByToken');
    const compareIfBeforeSpy = jest.spyOn(dayjsFacade, 'compareIfBefore');
    const dateNowSpy = jest
      .spyOn(dayjsFacade, 'dateNow')
      .mockReturnValue(recent_date);
    const findByIdSpy = jest.spyOn(userRepository, 'findById');
    const hashSpy = jest.spyOn(bcryptFacade, 'hash').mockResolvedValueOnce('any_hash');
    const addSpy = jest.spyOn(userRepository, 'add');
    const deleteByIdSpy = jest.spyOn(tokenRepository, 'deleteById');

    await resetPasswordUserUseCase.execute({
      token,
      password,
    });

    expect(findBytokenSpy).toBeCalledWith(token);
    expect(dateNowSpy).toBeCalled();
    expect(compareIfBeforeSpy).toBeCalledWith(expires_in, recent_date);
    expect(findByIdSpy).toBeCalledWith(id_user);
    expect(hashSpy).toBeCalledWith(password);
    expect(addSpy).toBeCalledWith(expect.objectContaining({
      password: 'any_hash',
    }));
    expect(deleteByIdSpy).toBeCalled();
  });

  it('should resetPasswordUserController call your methods correctly', async () => {
    const password = faker.internet.password();
    const token = faker.datatype.uuid();
    const request_body = {
      body: {
        password,
      },
      query: {
        token,
      },
    };

    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(resetPasswordUserUseCase, 'execute');

    await resetPasswordUserController.handle(request_body);

    expect(checkSpy).toBeCalledWith({
      body: request_body.body,
      fields: ['password'],
    });

    expect(executeSpy).toBeCalledWith({
      token,
      password,
    });
  });
});
