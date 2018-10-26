import { request } from 'graphql-request';
import { User } from '../../entity/User';

import { errorMessages } from './errorMessages';
import { createTypeOrmConn } from '../../startTypeOrm';
import { Connection } from 'typeorm';

let db: Connection;

const goodEmail = "test@register.com";
const goodPassword = "secretpass";

const shortEmail = 'ts';
const shortPassword = 'sp';

const mutation = (email: string, password: string) => `mutation { 
  register(email: "${email}", password: "${password}") {
    path
    message
  }
}`;

beforeAll(async (done) => {
  db = await createTypeOrmConn();
  done();
})

afterAll(() => db.close());

describe('Feature: User Registration - Success', () => {
  test('Successful user registration returns null', async (done) => {
    const response = await request(process.env.HOST as string, mutation(goodEmail, goodPassword));
    expect(response).toEqual({ register: null });
    done();
  });
  test('AND one matching user by email is found in the database', async (done) => {
    const users = await User.find({ where: { goodEmail } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(goodEmail);
    done();
  });
  test('AND matching user hashed password does not equal clear password', async (done) => {
    const users = await User.find({ where: { goodEmail } });
    const user = users[0];
    expect(user.password).not.toEqual(goodPassword);
    done();
  });

});

describe('Feature: User Registration - Failure', () => {
  test('AND duplicate user registration returns error', async (done) => {
    const response: any = await request(process.env.HOST as string, mutation(goodEmail, goodPassword));
    expect(response.register[0]).toEqual({
      path: 'email',
      message: errorMessages.duplicateEmail,
    });
    done();
  });
  test('AND password below 3 characters returns error', async (done) => {
    const response: any = await request(process.env.HOST as string, mutation(goodEmail, shortPassword));
    expect(response.register[0]).toEqual({
      path: 'password',
      message: errorMessages.passwordTooShort,
    });
    done();
  });
  test('AND email address below 3 characters returns two errors', async (done) => {
    const response: any = await request(process.env.HOST as string, mutation(shortEmail, goodPassword));
    expect(response.register).toEqual([
      {
        path: 'email',
        message: errorMessages.emailTooShort,
      },
      {
        path: 'email',
        message: errorMessages.emailInvalid,
      },
    ]);
    done();
  });
  test('AND short email and password returns three errors', async (done) => {
    const response: any = await request(process.env.HOST as string, mutation(shortEmail, shortPassword));
    expect(response.register).toEqual([
      {
        path: 'email',
        message: errorMessages.emailTooShort,
      },
      {
        path: 'email',
        message: errorMessages.emailInvalid,
      },
      {
        path: 'password',
        message: errorMessages.passwordTooShort,
      },
    ]);
    done();
  }); 
})
