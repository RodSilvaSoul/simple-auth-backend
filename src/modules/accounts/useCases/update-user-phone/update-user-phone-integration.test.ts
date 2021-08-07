import faker from 'faker';
import { sign } from 'jsonwebtoken';
import 'reflect-metadata';
import request, { SuperTest, Test } from 'supertest';
import { container } from 'tsyringe';
import { Connection } from 'typeorm';

import auth from '@config/auth';
import { loadConnection } from '@config/typeorm';
import {
  User,
  UserPhone,
  UserPhoneTypes,
} from '@modules/accounts/infra/typorm/entities';

import { UpdateUserPhoneUseCase } from './update-user-phone-useCase';

const mock_user = {
  id: faker.datatype.uuid(),
  email: 'any_email',
  password: 'any_password',
  name: 'any_name',
};

const mock_user_phone_type = {
  id: faker.datatype.uuid(),
  type: 'cellphone',
};

const mock_user_phone = {
  id: faker.datatype.uuid(),
  id_user: mock_user.id,
  id_user_phone_types: mock_user_phone_type.id,
  phone_number: '9284582418',
  type: 'cellphone',
};

const new_user_phone = {
  phone_number: '123456789',
  type: 'cellphone',
};

const base_url = `/api/v1/phone/update/${mock_user.id}`;

describe('creat user phone: integration', () => {
  let connection: Connection;
  let api: SuperTest<Test>;
  let updateUserPhoneUseCase: UpdateUserPhoneUseCase;

  beforeAll(async () => {
    connection = await loadConnection();
    await connection.runMigrations();

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([mock_user])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(UserPhoneTypes)
      .values([mock_user_phone_type])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(UserPhone)
      .values([mock_user_phone])
      .execute();

    const { app } = await import('@config/server/app');

    updateUserPhoneUseCase = container.resolve('UpdateUserPhoneUseCase');

    api = request(app);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  const access_token = sign({}, auth.secret_token);
  it('should update a new user phone for a registered user', async () => {
    const http_response = await api
      .put(base_url)
      .send(new_user_phone)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(200);

    expect(http_response.body).toEqual(new_user_phone);
  });
  it('should not accept a invalid access token', async () => {
    const invalid_access_token = sign({}, 'invalid_secret');

    const http_response = await api
      .put(base_url)
      .send(new_user_phone)
      .set({
        authorization: `Bearer ${invalid_access_token}`,
      })
      .expect(401);

    expect(http_response.body.error).toBe('Token invalid');
  });

  it('should not accept a request missing the access token', async () => {
    const http_response = await api
      .put(base_url)
      .send(new_user_phone)
      .expect(401);

    expect(http_response.body.error).toBe('Token missing');
  });

  it('should not accept a empty body request', async () => {
    const http_response = await api
      .put(base_url)
      .send({})
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toEqual('The body requisition is empty');
  });

  it('should not create a new user phone for a not registered user', async () => {
    const id = faker.datatype.uuid();

    const invalid_url = `/api/v1/phone/update/${id}`;

    const http_response = await api
      .put(invalid_url)
      .send(new_user_phone)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe('User not found');
  });

  it('should not accept a body request missing requirers params', async () => {
    const http_response = await api
      .put(base_url)
      .send({
        ...new_user_phone,
        type: '',
      })
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe('The filed(s): [type] is missing.');
  });

  it('should not accept a invalid phone number', async () => {
    const http_response = await api
      .put(base_url)
      .send({
        ...new_user_phone,
        phone_number: '12345',
      })
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe(
      'The param: phone_number have less than 9 characters',
    );
  });
  it('should not accept id_user with a invalid uuid format', async () => {
    const id = 'any_id';

    const invalid_url = `/api/v1/phone/update/${id}`;

    const http_response = await api
      .put(invalid_url)
      .send(new_user_phone)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(400);

    expect(http_response.body.error).toBe(
      'The id_user does not have a valid uuid format',
    );
  });

  it('should returns a server error if UpdateUserPhoneUseCase throws an error', async () => {
    jest
      .spyOn(updateUserPhoneUseCase, 'execute')
      .mockRejectedValueOnce(new Error());

    const http_response = await api
      .put(base_url)
      .send(new_user_phone)
      .set({
        authorization: `Bearer ${access_token}`,
      })
      .expect(500);

    expect(http_response.body.error).toBe('Internal server error');
  });
});
