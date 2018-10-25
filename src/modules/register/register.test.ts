import { request } from 'graphql-request';
import { User } from '../../entity/User';

import { errorMessages } from './errorMessages';
import { startServer } from '../../start-server';

// import { createTypeOrmConn } from '../utils/createTypeOrmConn';
// TODO: Find a way to close the TypeORM Connection as well as the server

const goodEmail = "test1@test.com";
const goodPassword = "secretpass";

const shortEmail = 'ts';
const shortPassword = 'sp';

const mutation = (email: string, password: string) => `mutation { 
  register(email: "${email}", password: "${password}") {
    path
    message
  }
}`;

let getHost = () => '';

// TODO: Specify type for dbConnection
let app: any;

// Start server before testing / close server after testing
beforeAll(async done => {
  app = await startServer();
  const { port } = app.address();
  getHost = () => `http://127.0.0.1:${port}`
  // dbConnection = await createTypeOrmConn();
  done();
})

afterAll(async done => {
  await app.close();;
  done();
})

describe('Feature: User Registration - Success', () => {
  test('Successful user registration returns null', async (done) => {
    const response = await request(getHost(), mutation(goodEmail, goodPassword));
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
    const response: any = await request(getHost(), mutation(goodEmail, goodPassword));
    expect(response.register[0]).toEqual({
      path: 'email',
      message: errorMessages.duplicateEmail,
    });
    done();
  });
  test('AND password below 3 characters returns error', async (done) => {
    const response: any = await request(getHost(), mutation(goodEmail, shortPassword));
    expect(response.register[0]).toEqual({
      path: 'password',
      message: errorMessages.passwordTooShort,
    });
    done();
  });
  test('AND email address below 3 characters returns two errors', async (done) => {
    const response: any = await request(getHost(), mutation(shortEmail, goodPassword));
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
    const response: any = await request(getHost(), mutation(shortEmail, shortPassword));
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
