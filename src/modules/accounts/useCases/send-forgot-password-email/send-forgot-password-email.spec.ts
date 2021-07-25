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
import { notFound, serverError } from '@shared/http';
import { right } from '@shared/utils';

import {
  SendForgotPasswordEmailUseCase,
  SendForgotPasswordEmailController,
} from '.';
import { UserNotFoundError } from './errors';

jest.genMockFromModule('path');

let sendForgotPasswordEmailUseCase: SendForgotPasswordEmailUseCase;
let sendForgotPasswordEmailController: SendForgotPasswordEmailController;
let dayjsFacade: DayjsFacade;
let tokenRepository: TokenRepositoryInMemory;
let userRepository: UserRepositoryInMemory;
let emailProvider: EmailProviderInMemory;
let bodyRequestValidator: BodyRequestValidator;
let uuidProvider: UuidFacade;

describe('send forgot password email', () => {
  beforeEach(() => {
    dayjsFacade = new DayjsFacade();
    tokenRepository = new TokenRepositoryInMemory();
    emailProvider = new EmailProviderInMemory();
    userRepository = new UserRepositoryInMemory();
    bodyRequestValidator = new BodyRequestValidator();
    uuidProvider = new UuidFacade();
    sendForgotPasswordEmailUseCase = new SendForgotPasswordEmailUseCase(
      userRepository,
      tokenRepository,
      dayjsFacade,
      uuidProvider,
      emailProvider,
    );

    sendForgotPasswordEmailController = new SendForgotPasswordEmailController(
      sendForgotPasswordEmailUseCase,
      bodyRequestValidator,
    );
  });

  it('should send a email reset password email for a registred user', async () => {
    const email = faker.internet.email();

    await userRepository.add({
      email,
      name: faker.internet.userName(),
      password: faker.internet.password(),
    });

    const httpRequest = {
      body: {
        email,
      },
    };

    const httpResponse = await sendForgotPasswordEmailController.handle(
      httpRequest,
    );

    expect(httpResponse.statusCode).toBe(200);
  });

  it('should returns a not found status if the email is not registred', async () => {
    const httpRequest = {
      body: {
        email: faker.internet.email(),
      },
    };

    const httpResponse = await sendForgotPasswordEmailController.handle(
      httpRequest,
    );

    expect(httpResponse).toEqual(notFound(new UserNotFoundError()));
  });

  it('should returns a server error status if sendForgotPasswordEmailUseCase.execute() throws a error', async () => {
    const httpRequest = {
      body: {
        email: faker.internet.email(),
      },
    };

    jest
      .spyOn(sendForgotPasswordEmailUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await sendForgotPasswordEmailController.handle(
      httpRequest,
    );

    expect(httpResponse).toEqual(serverError());
  });

  it('should sendForgotPasswordEmailController call correctly your methods', async () => {
    const httpRequest = {
      body: {
        email: faker.internet.email(),
      },
    };

    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest
      .spyOn(sendForgotPasswordEmailUseCase, 'execute')
      .mockResolvedValueOnce(right(true));

    await sendForgotPasswordEmailController.handle(httpRequest);

    expect(checkSpy).toBeCalledWith({
      body: httpRequest.body,
      fields: ['email'],
    });

    expect(executeSpy).toBeCalledWith(httpRequest.body.email);
  });

  it('should sendForgotPasswordEmailUseCase call correctly your methods', async () => {
    const email = faker.internet.email();

    await userRepository.add({
      name: faker.internet.userName(),
      password: faker.internet.password(),
      email,
    });

    const httpRequest = {
      body: {
        email,
      },
    };

    const expires_in = faker.date.recent();

    const findByEmailSpy = jest.spyOn(userRepository, 'findByEmail');
    const resolveSpy = jest.spyOn(path, 'resolve').mockReturnValue('any_path');
    const createSpy = jest
      .spyOn(uuidProvider, 'create')
      .mockResolvedValueOnce('any_token');
    const addDaysSpy = jest
      .spyOn(dayjsFacade, 'addDays')
      .mockReturnValueOnce(expires_in);
    const addSpy = jest.spyOn(tokenRepository, 'add');
    const sendMailSpy = jest.spyOn(emailProvider, 'sendMail');

    await sendForgotPasswordEmailController.handle(httpRequest);

    expect(findByEmailSpy).toBeCalledWith(email);
    expect(resolveSpy).toBeCalled();
    expect(createSpy).toBeCalled();
    expect(addDaysSpy).toBeCalledWith(3);

    expect(addSpy).toBeCalledWith(
      expect.objectContaining({
        token: 'any_token',
        expires_in,
      }),
    );

    expect(sendMailSpy).toBeCalled();
  });
});