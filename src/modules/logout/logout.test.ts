import { Connection } from "typeorm";

import { createTypeOrmConn } from "../../startTypeOrm";
import { User } from "../../entity/User";
import { TestClient } from '../../utils/TestClient';

let db: Connection;
let userId: string;

const goodEmail = 'test@logout.com';


beforeAll(async (done) => {
  const testClient = new TestClient(<string>process.env.HOST);
  db = await createTypeOrmConn();
  
  // Register and confirm user with email: goodEmail
  await testClient.mutation('register', goodEmail);
  const user = await User.findOne({ where: { email: goodEmail } });
  userId = (<User>user).id;
  await User.update({ id: userId }, { confirmed: true });

  done();
});

afterAll(() => db.close());

describe('Feature - User Logout - Success', () => {
  // Instantiate two clients to simulate same user with two devices
  const testClient1 = new TestClient(<string>process.env.HOST);
  const testClient2 = new TestClient(<string>process.env.HOST);

  test('Logged in user has active session', async() => {
    // POST login mutation to secure cookie
    await testClient1.mutation('login', goodEmail);

    // POST echo query with cookie to retrieve userid/email data
    const response = await testClient1.echo();

    // Confirm that userid and email match Postgres record
    expect(response.data.echo).toEqual({
      id: userId,
      email: goodEmail,
    });
  });

  test('AND logging out destroys single session', async() => {
    // POST logout query with cookie to destroy session
    await testClient1.logout();

    // POST echo query with cookie to retrieve userid/email data
    const response = await testClient1.echo();

    // Confirm that echo returns null
    expect(response.data.echo).toBeNull();
  });

  test('AND logging out destroys multiple sessions', async() => {
    // POST login mutation for two clients (e.g., laptop and mobile) to secure cookies
    await testClient1.mutation('login', goodEmail);
    await testClient2.mutation('login', goodEmail);

    // Confirm that id and email are same for both sessions
    expect(await testClient1.echo()).toEqual(await testClient2.echo());

    // POST logout query to client1 to destroy session
    await testClient1.logout();

    // Confirm that echo for client1 returns null
    const response1 = await testClient1.echo();
    expect(response1.data.echo).toBeNull();

    // Confirm that echo for client2 also returns null
    const response2 = await testClient2.echo();
    expect(response2.data.echo).toBeNull();

  });

});
