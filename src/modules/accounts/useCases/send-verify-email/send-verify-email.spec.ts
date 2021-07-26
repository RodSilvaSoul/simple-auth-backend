import faker from 'faker';
import path from 'path';

import {
  TokenRepositoryInMemory,
  UserRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { EmailProviderInMemory } from '@shared/container/providers/email/in-memory';
import { UuidFacade } from '@shared/container/providers/uuid/implementations';
import { BodyRequestValidator } from '@shared/container/providers/validator/implementations';
import { UserNotFoundError } from '@shared/errors/useCase';
import { EmptyBodyError } from '@shared/errors/validator';
import { badRequest, notFound, serverError } from '@shared/http';

import { SendVerifyEmailController, SendVerifyEmailUseCase } from '.';

jest.mock('path', () => ({
  resolve: () => 'any_path',
  dirname: () => 'any_dirname',
}));

let sendVerifyEmailUseCase: SendVerifyEmailUseCase;
let sendVeriyEmailController: SendVerifyEmailController;
let dayjsFacade: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;
let userRepository: UserRepositoryInMemory;
let emailProvider: EmailProviderInMemory;
let bodyRequestValidator: BodyRequestValidator;
let uuidProvider: UuidFacade;

describe('send verify email', () => {
  beforeEach(() => {
    emailProvider = new EmailProviderInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    uuidProvider = new UuidFacade();
    userRepository = new UserRepositoryInMemory();
    tokenRepository = new TokenRepositoryInMemory();
    dayjsFacade = new DayjsFacade();
    sendVerifyEmailUseCase = new SendVerifyEmailUseCase(
      emailProvider,
      userRepository,
      tokenRepository,
      dayjsFacade,
      uuidProvider,
    );

    sendVeriyEmailController = new SendVerifyEmailController(
      sendVerifyEmailUseCase,
      bodyRequestValidator,
    );
  });

  it('should SendVerifyEmailUseCase call your methods correctly', async () => {
    const email = faker.internet.email();
    const expires_in = faker.date.future();

    userRepository.users.push({
      id: faker.datatype.uuid(),
      avatar_url: 'any_url',
      created_at: faker.date.soon(),
      email,
      name: faker.internet.userName(),
      password: faker.internet.password(),
      isVerified: true,
    });

    const findByEmailSpy = jest.spyOn(userRepository, 'findByEmail');
    const resoulveSpy = jest.spyOn(path, 'resolve');
    const createSpy = jest
      .spyOn(uuidProvider, 'create')
      .mockResolvedValueOnce('any_token');
    const addHoursSpy = jest
      .spyOn(dayjsFacade, 'addHours')
      .mockReturnValueOnce(expires_in);
    const addSpy = jest.spyOn(tokenRepository, 'add');
    const sendMail = jest.spyOn(emailProvider, 'sendMail');

    await sendVerifyEmailUseCase.execute(email);

    expect(findByEmailSpy).toBeCalledWith(email);
    expect(resoulveSpy).toBeCalled();
    expect(createSpy).toBeCalled();
    expect(addHoursSpy).toBeCalledWith(3);
    expect(addSpy).toBeCalledWith(
      expect.objectContaining({
        token: 'any_token',
        expires_in,
      }),
    );

    expect(sendMail).toBeCalled();
  });

  it('should sendVeriyEmailController call your methods correctly', async () => {
    const body_request = {
      body: {
        email: faker.internet.email(),
      },
    };

    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(sendVerifyEmailUseCase, 'execute');

    await sendVeriyEmailController.handle(body_request);

    expect(checkSpy).toBeCalledWith({
      body: body_request.body,
      fields: ['email'],
    });

    expect(executeSpy).toBeCalledWith(body_request.body.email);
  });
  it('should send a verify email if the user is registered ', async () => {
    const email = faker.internet.email();

    userRepository.users.push({
      id: faker.datatype.uuid(),
      avatar_url: 'any_url',
      created_at: faker.date.soon(),
      email,
      name: faker.internet.userName(),
      password: faker.internet.password(),
      isVerified: true,
    });

    const body_request = {
      body: {
        email,
      },
    };

    const httpResponse = await sendVeriyEmailController.handle(body_request);

    expect(httpResponse.statusCode).toBe(200);
  });

  it('should returns a not found status if the email is no registred', async () => {
    const body_request = {
      body: {
        email: faker.internet.email(),
      },
    };

    const httpResponse = await sendVeriyEmailController.handle(body_request);

    expect(httpResponse).toEqual(notFound(new UserNotFoundError()));
  });

  it('should return an bad request status if the email field in the request body is missing', async () => {
    const httpResponse = await sendVeriyEmailController.handle({ body: {} });

    expect(httpResponse).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should return a sever error status if sendForgotPasswordEmailUseCase.execute() throws an error', async () => {
    const body_request = {
      body: {
        email: faker.internet.email(),
      },
    };

    jest
      .spyOn(sendVerifyEmailUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await sendVeriyEmailController.handle(body_request);

    expect(httpResponse).toEqual(serverError());
  });
});
