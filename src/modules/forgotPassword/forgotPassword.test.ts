import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";
import { User } from "../../entity/User";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";
import { redis } from "../../startRedis";
import { errorMessages } from "../../utils/errorMessages";
import { createTestConn } from "../../testUtils/createTestConn";

const goodEmail = 'test@forgotpass.com';
const newPassword = 'sup3rs3cretp@ss';
const newPassword2 = 'u1tras3cretp@ss';
const shortPassword = 'sp';

let db: Connection;
let key: string;
let userId: string;

beforeAll(async(done) => {
  const testClient = new TestClient(<string>process.env.HOST);
  db = await createTestConn();

  // Register and confirm user with email: goodEmail
  await testClient.mutation('register', goodEmail);
  const user = await User.findOne({ where: { email: goodEmail } });
  userId = (<User>user).id;
  await User.update({ id: userId }, { confirmed: true });

  done();
});

afterAll(() => db.close());

describe('Feature - User Forgot Password - Success', () => {
  const testClient = new TestClient(<string> process.env.HOST);

  test('Generating a new Password Link locks the account', async(done) => {
    // Calling sendForgotPasswordEmail locks the account
    await testClient.sendForgotPasswordEmail(goodEmail);

    // Attempting to log in after an account lock returns na error
    const lockedResponse = await testClient.mutation('login', goodEmail);
    expect(lockedResponse.data.login).toEqual([
      {
        path: 'locked',
        message: errorMessages.login.lockedAccount,
      }
    ]);

    done();
  })

  test('AND successful forgotPasswordChange call with new password and valid key returns null', async(done) => {
    // Generate a forgotten password link and extract key
    const url = await createForgotPasswordLink('', userId, redis);
    const parts = url.split('/');
    key = parts[parts.length - 1];
    
    const response = await testClient.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    done();
  })

  test('AND user is able to log in (return null) using new password', async (done) => {
    // login mutation with new password should yield null (successful login)
    const loginResponse = await testClient.mutation('login', goodEmail, newPassword);
    expect(loginResponse.data.login).toBeNull();
    
    done();
  });

  test('AND matching user hashed password does not equal clear password', async (done) => {
    const user = await User.findOne({ where: { email: goodEmail } });
    expect((<User>user).password).not.toEqual(newPassword);
    done();
  });

});

describe('Feature - User Forgot Password - Failure', () => {
  const testClient = new TestClient(<string> process.env.HOST);

  test('AND user cannot change to too-short password', async() => {
    // Generate a forgotten password link and extract key
    const url = await createForgotPasswordLink('', userId, redis);
    const parts = url.split('/');
    key = parts[parts.length - 1];

    // call forgotPasswordChange with short password
    const shortPassResponse = await testClient.forgotPasswordChange(shortPassword, key);
    expect(shortPassResponse.data.forgotPasswordChange).toEqual([
      {
        path: 'newPassword',
        message: errorMessages.forgotPassword.passwordTooShort,
      }
    ]);
  })

  test('AND user cannot change password without correct key', async() => {
    const badKeyResponse = await testClient.forgotPasswordChange(newPassword, newPassword2);
    expect(badKeyResponse.data.forgotPasswordChange).toEqual([
      {
        path: 'key',
        message: errorMessages.forgotPassword.invalidKey,
      }
    ]);
  });

  test('AND redis key expires once password successfully changed', async() => {
    await testClient.forgotPasswordChange(newPassword, key);
    const secondTryResponse = await testClient.forgotPasswordChange(newPassword2, key);
    expect(secondTryResponse.data.forgotPasswordChange).toEqual([
      {
        path: 'key',
        message: errorMessages.forgotPassword.invalidKey,
      }
    ]);
  });
});
