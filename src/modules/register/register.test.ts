import { request } from 'graphql-request';
import { User } from '../../entity/User';

import { startServer } from '../../start-server';

// import { createTypeOrmConn } from '../utils/createTypeOrmConn';
// TODO: Find a way to close the TypeORM Connection as well as the server

const email = "test1@test.com";
const password = "secretpass";

const mutation = `mutation { 
  register(email: "${email}", password: "${password}") {
    path
    message
  }
}`;

let getHost = () => '';

// TODO: Specify type for dbConnection
let app: any;

describe('Feature: User Registration', () => {
  beforeAll(async done => {
    app = await startServer();
    const { port } = app.address();
    getHost = () => `http://127.0.0.1:${port}`
    // dbConnection = await createTypeOrmConn();
    done();
  })
  test('Successful user registration returns null', async (done) => {
    const response = await request(getHost(), mutation);
    expect(response).toEqual({ register: null });
    done();
  });
  test('AND one matching user by email is found in the database', async (done) => {
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    done();
  });
  test('AND matching user hashed password does not equal clear password', async (done) => {
    const users = await User.find({ where: { email } });
    const user = users[0];
    expect(user.password).not.toEqual(password);
    done();
  });
  test('BUT duplicate user registration returns error', async (done) => {
    const response: any = await request(getHost(), mutation);
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toEqual('email');
    done();
  });
  afterAll(async done => {
    await app.close();;
    done();
  })
});
