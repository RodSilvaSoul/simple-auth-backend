/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import '@shared/container';
import { Connection, createConnection } from 'typeorm';

import { app } from '@config/server/app';

const api = request(app);

const base_url = '/api/avi/sign';

describe('create user:integration test', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection('test');
  });

  afterAll(async () => {
    connection.dropDatabase();
    connection.close();
  });
  it('should create a new user', async () => {
    const new_user = {
      name: 'any_name',
      email: 'example@example,com',
      password: '12345678',
    };

    const http_response = await api.post(base_url).send(new_user).expect(200);
    expect(http_response.body).toBeFalsy();
  });
});
