import { Connection } from 'typeorm';

import { createTypeOrmConn } from '../../startTypeOrm';
import { User } from '../../entity/User';
import { TestClient } from '../../utils/TestClient';

let db: Connection;
let userId: string;
let loggedOutUserId: string;

const goodEmail = 'test@echo.com';
const loggedOutEmail = 'test@notloggedin.com';

beforeAll(async (done) => {
  const testClient = new TestClient(<string>process.env.HOST);

  // Connect to Type ORM
  db = await createTypeOrmConn();

  // Register and confirm user with email: goodEmail
  await testClient.mutation('register', goodEmail);
  const user = await User.findOne({ where: { email: goodEmail } });
  userId = (<User>user).id;
  await User.update({ id: userId }, { confirmed: true });

  // Register and confirm user with email: loggedOutEmail
  await testClient.mutation('register', loggedOutEmail);
  const loggedOutUser = await User.findOne({ where: { email: loggedOutEmail } });
  loggedOutUserId = (<User>loggedOutUser).id;
  await User.update({ id: loggedOutUserId }, { confirmed: true });

  done();
});

afterAll(() => db.close());

describe('Feature - Session Query - Success', () => {
  const testClient = new TestClient(<string>process.env.HOST);

  test('When cookie is saved, echo query returns email and cookie', async () => {
    // POST login mutation to secure cookie
    await testClient.mutation('login', goodEmail);

    // POST echo query with cookie to retrieve userid/email data
    const response = await testClient.echo();

    // Confirm that userid and email match Postgres record
    expect(response.data.echo).toEqual({
      id: userId,
      email: goodEmail,
    });
  })
});

describe('Feature - Session Query - Failure', () => {
  const testClient = new TestClient(<string>process.env.HOST);

  test('AND echo query returns null if user is not logged in', async () => {
    // POST echo query without cookie
    const response = await testClient.echo();

    // Confirm that echo returns null
    expect(response.data.echo).toBeNull();
  })
})

