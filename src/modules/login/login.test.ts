import { Connection } from "typeorm";

import { request } from 'graphql-request';

import { createTypeOrmConn } from "../../startTypeOrm";
import { User } from "../../entity/User";
import { errorMessages } from "./errorMessages";

let db: Connection;

const badEmail = 'test@unregistered.com';
const badPassword = 'wrongpass';
const goodEmail = 'test@login.com';
const goodPassword = 'secretpass';
const unconfirmedEmail = 'test@unconfirmed.com';
const unconfirmedPassword = 'secretpass';

const mutation = (type: string, email: string, password: string) => `mutation { 
  ${type}(email: "${email}", password: "${password}") {
    path
    message
  }
}`;

beforeAll(async (done) => {
  // Connect to Type ORM
  db = await createTypeOrmConn();

  // Register and confirm user with email: goodEmail
  await request(process.env.HOST as string, mutation('register', goodEmail, goodPassword));
  const user = await User.findOne({ where: { email: goodEmail } });
  const userId = (<User>user).id;
  await User.update({ id: userId }, { confirmed: true });

  // Register (but do not confirm) user with email: unconfirmedEmail
  await request(process.env.HOST as string, mutation('register', unconfirmedEmail, unconfirmedPassword));
  done();
});

afterAll(() => db.close());

describe('Feature: User Login - Success', () => {
  test('Successful user login returns null ', async (done) => {
    const response = await request(process.env.HOST as string, mutation('login', goodEmail, goodPassword));
    expect(response).toEqual({ login: null });
    done();
  });
});

describe('Feature: User Login - Failure', () => {
  test('AND login with an unconfirmed email returns an error', async (done) => {
    const response: any = await request(process.env.HOST as string, mutation('login', unconfirmedEmail, unconfirmedPassword));
    expect(response.login).toEqual([
      {
        path: 'confirmed',
        message: errorMessages.unconfirmedEmail,
      },
    ]);
    done();
  });
  test('AND login with an unregistered email returns an error', async (done) => {
    const response: any = await request(process.env.HOST as string, mutation('login', badEmail, badPassword));
    expect(response.login).toEqual([
      {
        path: 'email',
        message: errorMessages.invalidLogin,
      },
    ]);
    done();
  });
  test('AND login with an incorrect password returns the same error', async (done) => {
    const response: any = await request(process.env.HOST as string, mutation('login', goodEmail, badPassword));
    expect(response.login).toEqual([
      {
        path: 'email',
        message: errorMessages.invalidLogin,
      },
    ]);
    done();
  });
});
