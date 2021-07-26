import faker from 'faker';

import {
  UserRepositoryInMemory,
  TokenRepositoryInMemory,
} from '@modules/accounts/repositories/in-memory';
import { DayjsFacade } from '@shared/container/providers/date/implementations';
import { BcryptFacade } from '@shared/container/providers/hasher/implementations';
import { JwtFacade } from '@shared/container/providers/jwt/implementations';
import { BodyRequestValidator } from '@shared/container/providers/validator/implementations';
import { EmptyBodyError, MissingParamError } from '@shared/errors/validator';
import {
  badRequest,
  serverError,
  unauthorized,
} from '@shared/http';

import { EmailOrPasswordInvalid } from './erros';
import { UserAuthenticateController } from './user-authenticade-controller';
import { UserAuthenticateUseCase } from './user-authenticate-useCase';

let userAuthenticateUseCase: UserAuthenticateUseCase;
let userAuthenticateController: UserAuthenticateController;
let tokenRepository: TokenRepositoryInMemory;
let userRepository: UserRepositoryInMemory;
let jwtFacade: JwtFacade;
let bcryptFacade: BcryptFacade;
let dayjsFacade: DayjsFacade;
let bodyRequestValidator: BodyRequestValidator;

describe('user authenticate', () => {
  beforeEach(async () => {
    tokenRepository = new TokenRepositoryInMemory();
    userRepository = new UserRepositoryInMemory();
    jwtFacade = new JwtFacade();
    bcryptFacade = new BcryptFacade(2);
    dayjsFacade = new DayjsFacade();

    bodyRequestValidator = new BodyRequestValidator();
    userAuthenticateUseCase = new UserAuthenticateUseCase(
      userRepository,
      tokenRepository,
      jwtFacade,
      bcryptFacade,
      dayjsFacade,
    );

    userAuthenticateController = new UserAuthenticateController(
      userAuthenticateUseCase,
      bodyRequestValidator,
    );
  });
  it('should userAuthenticateUseCase call your methods correctly', async () => {
    const password = faker.internet.password();
    const email = faker.internet.email();
    const expires_in = faker.date.future();

    await userRepository.add({
      name: faker.internet.userName(),
      email,
      password,
    });

    const findByEmailSpy = jest.spyOn(userRepository, 'findByEmail');
    const compareSpy = jest
      .spyOn(bcryptFacade, 'compare')
      .mockResolvedValueOnce(true);
    const createTokenSpy = jest
      .spyOn(jwtFacade, 'createToken')
      .mockResolvedValue('any_jwt');
    const addDaysSpy = jest
      .spyOn(dayjsFacade, 'addDays')
      .mockReturnValueOnce(expires_in);
    const addSpy = jest.spyOn(tokenRepository, 'add');

    await userAuthenticateUseCase.execute({
      password,
      email,
    });

    expect(findByEmailSpy).toBeCalledWith(email);
    expect(compareSpy).toBeCalledWith(password, password);
    expect(createTokenSpy).toBeCalledTimes(2);
    expect(addDaysSpy).toBeCalled();
    expect(addSpy).toBeCalledWith(
      expect.objectContaining({
        token: 'any_jwt',
        expires_in,
      }),
    );
  });

  it('should userAuthenticateController call your methods correctly', async () => {
    const request_body = {
      body: {
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    };

    const checkSpy = jest.spyOn(bodyRequestValidator, 'check');
    const executeSpy = jest.spyOn(userAuthenticateUseCase, 'execute');

    await userAuthenticateController.handle(request_body);

    expect(checkSpy).toBeCalledWith({
      body: request_body.body,
      fields: ['password', 'email'],
    });

    expect(executeSpy).toBeCalledWith(request_body.body);
  });
  it('should authenticate a registered user', async () => {
    const password = faker.internet.password();
    const passwordHash = await bcryptFacade.hash(password);

    const user_db = {
      name: faker.internet.userName(),
      email: faker.internet.email(),
      password: passwordHash,
    };

    const request_body = {
      body: {
        ...user_db,
        password,
      },
    };

    const { id } = await userRepository.add(user_db);

    const httpReponse = await userAuthenticateController.handle(request_body);

    const { email, name } = user_db;

    expect(httpReponse.statusCode).toBe(200);

    expect(httpReponse.body).toEqual(
      expect.objectContaining({
        user: {
          id,
          name,
          email,
        },
      }),
    );

    expect(httpReponse.body.refreshToken).toBeTruthy();
    expect(httpReponse.body.accessToken).toBeTruthy();
  });

  it('should not authenticate a user with invalid credentials', async () => {
    const password = faker.internet.password();
    const passwordHash = await bcryptFacade.hash(password);

    const user_db = {
      name: faker.internet.userName(),
      email: faker.internet.email(),
      password: passwordHash,
    };

    const request_body = {
      body: {
        ...user_db,
        password,
      },
    };

    await userRepository.add(user_db);

    const httpReponse = await userAuthenticateController.handle({
      body: {
        ...request_body.body,
        password: '123',
      },
    });

    expect(httpReponse).toEqual(unauthorized(new EmailOrPasswordInvalid()));
  });

  it('should not accpet a empty body request', async () => {
    const httpResponse = await userAuthenticateController.handle({});

    expect(httpResponse).toEqual(badRequest(new EmptyBodyError()));
  });

  it('should not accpet a body request missing a requerid field', async () => {
    const request_body = {
      body: {
        email: faker.internet.email(),
      },
    };
    const httpResponse = await userAuthenticateController.handle(request_body);

    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')));
  });

  it('should returns a server error if userAuthenticateUseCase.execute() throws an error', async () => {
    const request_body = {
      body: {
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    };

    jest
      .spyOn(userAuthenticateUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const httpResponse = await userAuthenticateController.handle(request_body);

    expect(httpResponse).toEqual(serverError());
  });
});
