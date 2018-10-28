import axios from 'axios';

import { Connection } from 'typeorm';
import { request } from 'graphql-request';

import { createTypeOrmConn } from '../../startTypeOrm';
import { User } from '../../entity/User';

let db: Connection;
let userId: string;

const goodEmail = 'test@echo.com';
const goodPassword = 'secretpass';

const mutation = (type: string, email: string, password: string) => `mutation { 
  ${type}(email: "${email}", password: "${password}") {
    path
    message
  }
}`;

const echoQuery = `
{
  echo {
    id
    email
  }
}
`;

beforeAll(async (done) => {
  // Connect to Type ORM
  db = await createTypeOrmConn();

  // Register and confirm user with email: goodEmail
  await request(process.env.HOST as string, mutation('register', goodEmail, goodPassword));
  const user = await User.findOne({ where: { email: goodEmail } });
  userId = (<User>user).id;
  await User.update({ id: userId }, { confirmed: true });

  done();
});

afterAll(() => db.close());

describe('Feature - Session Query - Success', () => {
  // test('Cannot get user if not logged in', async () => {

  // });
  test('When cookie is saved, echo Query returns email and cookie', async () => {
    // POST login mutation to secure cookie
    await axios.post(
      <string>process.env.HOST,
      {
        query: mutation('login', goodEmail, goodPassword)
      },
      {
        withCredentials: true, // Saves cookie
      },
    );

    // POST echo query with cookie to retrieve userid/email data
    const response = await axios.post(
      <string>process.env.HOST,
      {
        query: echoQuery
      },
      {
        withCredentials: true, // Saves cookie
      },
    );

    // Confirm that userid and email match Postgres record
    expect(response.data.data.echo).toEqual({
      id: userId,
      email: goodEmail,
    });
  })
});
