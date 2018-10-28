import { Connection } from "typeorm";

import { createTypeOrmConn } from "../../startTypeOrm";
import { User } from "../../entity/User";
import { TestClient } from '../../utils/TestClient';

let db: Connection;
let userId: string;

const goodEmail = 'test@logout.com';

const testClient = new TestClient(<string>process.env.HOST);

beforeAll(async (done) => {
  db = await createTypeOrmConn();
  
  // Register and confirm user with email: goodEmail
  await testClient.mutation('register', goodEmail);
  const user = await User.findOne({ where: { email: goodEmail } });
  userId = (<User>user).id;
  await User.update({ id: userId }, { confirmed: true });

  // POST login mutation to secure cookie
  await testClient.mutation('login', goodEmail);
  // await testUtils.loginPost(goodEmail);

  done();
});

afterAll(() => db.close());

describe('Feature - User Logout - Success', () => {
  test('Logged in user has active session', async() => {
    // POST echo query with cookie to retrieve userid/email data
    const response = await testClient.echo();

    // Confirm that userid and email match Postgres record
    expect(response.data.echo).toEqual({
      id: userId,
      email: goodEmail,
    });
  });

  test('AND logging out destroys session', async() => {
    // POST logout query with cookie to destroy session
    await testClient.logout();

    // POST echo query with cookie to retrieve userid/email data
    const response = await testClient.echo();

    // Confirm that echo returns null
    expect(response.data.echo).toBeNull();
  });
});
