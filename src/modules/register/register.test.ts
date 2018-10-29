import { User } from '../../entity/User';

import { Connection } from 'typeorm';
import { TestClient } from '../../utils/TestClient';
import { errorMessages } from '../../utils/errorMessages';
import { createTestConn } from '../../testUtils/createTestConn';

let db: Connection;

const goodEmail = "test@register.com";

const shortEmail = 'ts';
const shortPassword = 'sp';

beforeAll(async (done) => {
  db = await createTestConn();
  done();
})

afterAll(() => db.close());

describe('Feature: User Registration - Success', () => {
  const testClient = new TestClient(<string>process.env.HOST);

  test('Successful user registration returns null', async (done) => {
    const response = await testClient.mutation('register', goodEmail);
    expect(response.data).toEqual({ register: null });
    done();
  });
  test('AND one matching user by email is found in the database', async (done) => {
    const users = await User.find({ where: { email: goodEmail } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(goodEmail);
    done();
  });
  test('AND matching user hashed password does not equal clear password', async (done) => {
    const user = await User.findOne({ where: { email: goodEmail } });
    expect((<User>user).password).not.toEqual(testClient.goodPass);
    done();
  });

});

describe('Feature: User Registration - Failure', () => {
  const testClient = new TestClient(<string>process.env.HOST);

  test('AND duplicate user registration returns error', async (done) => {
    const response = await testClient.mutation('register', goodEmail);
    expect(response.data.register[0]).toEqual({
      path: 'email',
      message: errorMessages.register.duplicateEmail,
    });
    done();
  });
  test('AND password below 3 characters returns error', async (done) => {
    const response: any = await testClient.mutation('register', goodEmail, shortPassword);
    expect(response.data.register[0]).toEqual({
      path: 'password',
      message: errorMessages.register.passwordTooShort,
    });
    done();
  });
  test('AND email address below 3 characters returns two errors', async (done) => {
    const response: any = await testClient.mutation('register', shortEmail);
    expect(response.data.register).toEqual([
      {
        path: 'email',
        message: errorMessages.register.emailTooShort,
      },
      {
        path: 'email',
        message: errorMessages.register.emailInvalid,
      },
    ]);
    done();
  });
  test('AND short email and password returns three errors', async (done) => {
    const response: any = await testClient.mutation('register', shortEmail, shortPassword);
    expect(response.data.register).toEqual([
      {
        path: 'email',
        message: errorMessages.register.emailTooShort,
      },
      {
        path: 'email',
        message: errorMessages.register.emailInvalid,
      },
      {
        path: 'password',
        message: errorMessages.register.passwordTooShort,
      },
    ]);
    done();
  }); 
})
