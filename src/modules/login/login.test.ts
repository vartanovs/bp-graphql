import { Connection } from "typeorm";

import { createTypeOrmConn } from "../../startTypeOrm";
import { User } from "../../entity/User";
import { TestClient } from "../../utils/TestClient";
import { errorMessages } from "../../utils/errorMessages";

let db: Connection;

const badEmail = 'test@unregistered.com';
const badPassword = 'wrongpass';
const goodEmail = 'test@login.com';
const lockedEmail = 'test@locked.com';
const unconfirmedEmail = 'test@unconfirmed.com';

beforeAll(async (done) => {
  const testClient = new TestClient(<string>process.env.HOST);

  // Connect to Type ORM
  db = await createTypeOrmConn();

  // Register and confirm user with email: goodEmail
  await testClient.mutation('register', goodEmail);
  const user = await User.findOne({ where: { email: goodEmail } });
  const userId = (<User>user).id;
  await User.update({ id: userId }, { confirmed: true });

  // Register, confirm and lock user with email: lockedEmail
  await testClient.mutation('register', lockedEmail);
  const lockedUser = await User.findOne({ where: { email: lockedEmail } });
  const lockedUserId = (<User>lockedUser).id;
  await User.update({ id: lockedUserId }, { confirmed: true });
  await User.update({ id: lockedUserId }, { forgotPasswordLocked: true });

  // Register (but do not confirm) user with email: unconfirmedEmail
  await testClient.mutation('register', unconfirmedEmail);
  done();
});

afterAll(() => db.close());

describe('Feature: User Login - Success', () => {
  const testClient = new TestClient(<string>process.env.HOST);

  test('Successful user login returns null ', async (done) => {
    const response = await testClient.mutation('login', goodEmail);
    expect(response.data).toEqual({ login: null });
    done();
  });
});

describe('Feature: User Login - Failure', () => {
  const testClient = new TestClient(<string>process.env.HOST);
  test('AND login with an unconfirmed email returns an error', async (done) => {
    const response = await testClient.mutation('login', unconfirmedEmail);
    expect(response.data.login).toEqual([
      {
        path: 'confirmed',
        message: errorMessages.login.unconfirmedEmail,
      },
    ]);
    done();
  });
  test('AND login with a locked email returns an error', async (done) => {
    const response = await testClient.mutation('login', lockedEmail);
    expect(response.data.login).toEqual([
      {
        path: 'locked',
        message: errorMessages.login.lockedAccount,
      },
    ]);
    done();
  });
  test('AND login with an unregistered email returns an error', async (done) => {
    const response = await testClient.mutation('login', badEmail, badPassword);
    expect(response.data.login).toEqual([
      {
        path: 'email',
        message: errorMessages.login.invalidLogin,
      },
    ]);
    done();
  });
  test('AND login with an incorrect password returns the same error', async (done) => {
    const response: any = await testClient.mutation('login', goodEmail, badPassword);
    expect(response.data.login).toEqual([
      {
        path: 'email',
        message: errorMessages.login.invalidLogin,
      },
    ]);
    done();
  });
});
