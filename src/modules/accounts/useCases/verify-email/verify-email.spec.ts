import faker from 'faker';

import {
  TokenRepositoryInMemory,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { InvalidTokenError } from '@shared/errors/useCase';
import { serverError, unauthorized } from '@shared/http';

import { VerifyEmailUseCase, VerifyEmailController } from '.';

let dayjsFacade: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;
let userRepository: UserRepositoryInMemory;
let verifyEmailUseCase: VerifyEmailUseCase;
let verifyEmailController: VerifyEmailController;

describe('verify email ', () => {
  beforeEach(() => {
    tokenRepository = new TokenRepositoryInMemory();
    dayjsFacade = new DayjsFacade();
    userRepository = new UserRepositoryInMemory();
    verifyEmailUseCase = new VerifyEmailUseCase(
      userRepository,
      tokenRepository,
      dayjsFacade,
    );
    verifyEmailController = new VerifyEmailController(verifyEmailUseCase);
  });
  it('should verifyEmailUseCase call your methods correctly', async () => {
    const token = faker.datatype.uuid();
    const id_user = faker.datatype.uuid();
    const id_token = faker.datatype.uuid();
    const expires_in = faker.date.future();
    const recent_date = faker.date.recent();
    const user = {} as any;

    tokenRepository.refreshTokens.push({
      id: id_token,
      id_user,
      expires_in,
      token,
      created_at: faker.date.recent(),
      user,
    });

    userRepository.users.push({
      id: id_user,
      avatar_url: 'any_url',
      created_at: faker.date.soon(),
      updated_at: faker.date.soon(),
      email: faker.internet.email(),
      name: faker.internet.userName(),
      password: faker.internet.password(),
      isVerified: false,
    });

    const findByTokenSpy = jest.spyOn(tokenRepository, 'findByToken');
    const compareIfBeforeSpy = jest.spyOn(dayjsFacade, 'compareIfBefore');
    const dateNowSpy = jest
      .spyOn(dayjsFacade, 'dateNow')
      .mockReturnValue(recent_date);
    const findByIdSpy = jest.spyOn(userRepository, 'findById');
    const addSpy = jest.spyOn(userRepository, 'add');
    const deleteByIdSpy = jest.spyOn(tokenRepository, 'deleteById');

    await verifyEmailUseCase.execute(token);

    expect(findByTokenSpy).toBeCalledWith(token);
    expect(dateNowSpy).toBeCalled();
    expect(compareIfBeforeSpy).toBeCalledWith(expires_in, recent_date);
    expect(findByIdSpy).toBeCalledWith(id_user);
    expect(addSpy).toBeCalledWith(
      expect.objectContaining({
        isVerified: true,
      }),
    );
    expect(deleteByIdSpy).toBeCalledWith(id_token);
  });

  it('should verifyEmailController call your methods correctly', async () => {
    const token = faker.datatype.uuid();

    const request = {
      query: {
        token,
      },
    };

    const executeSpy = jest.spyOn(verifyEmailUseCase, 'execute');

    await verifyEmailController.handle(request);

    expect(executeSpy).toBeCalledWith(token);
  });

  it('should verify a email of a registered user', async () => {
    const token = faker.datatype.uuid();

    await tokenRepository.add({
      token,
      expires_in: faker.date.future(),
      id_user: faker.datatype.uuid(),
    });

    userRepository.users.push({
      id: faker.datatype.uuid(),
      avatar_url: 'any_url',
      created_at: faker.date.soon(),
      updated_at: faker.date.soon(),
      email: faker.internet.email(),
      name: faker.internet.userName(),
      password: faker.internet.password(),
      isVerified: false,
    });

    const request = {
      query: {
        token,
      },
    };

    const httpResponse = await verifyEmailController.handle(request);

    expect(httpResponse.statusCode).toBe(200);
  });

  it('should not accept a request missing the token in the query', async () => {
    const httpResponse = await verifyEmailController.handle({ query: {} });

    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should not accept a invalid token', async () => {
    const request = {
      query: {
        token: faker.datatype.uuid(),
      },
    };

    const httpResponse = await verifyEmailController.handle(request);

    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should not accept a expired token', async () => {
    const token = faker.datatype.uuid();

    await tokenRepository.add({
      token,
      expires_in: faker.date.past(),
      id_user: faker.datatype.uuid(),
    });

    const request = {
      query: {
        token,
      },
    };

    const httpResponse = await verifyEmailController.handle(request);
    expect(httpResponse).toEqual(unauthorized(new InvalidTokenError()));
  });

  it('should return a sever error if verifyEmailUseCase.execute() throws an error', async () => {
    const request = {
      query: {
        token: faker.datatype.uuid(),
      },
    };

    jest
      .spyOn(verifyEmailUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await verifyEmailController.handle(request);

    expect(httpResponse).toEqual(serverError());
  });
});
