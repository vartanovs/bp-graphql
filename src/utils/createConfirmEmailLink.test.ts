import fetch from 'node-fetch';

import { request } from 'graphql-request';

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { User } from "../entity/User";
import { redis } from '../startRedis';
import { createTypeOrmConn } from '../startTypeOrm';
import { Connection } from 'typeorm';

let db: Connection;

let goodUrl: string;
let userId: string;

const goodEmail: string = 'test@confirm.com';
const goodPassword: string = 'secretpass';

const mutation = (email: string, password: string) => `mutation { 
  register(email: "${email}", password: "${password}") {
    path
    message
  }
}`;

beforeAll(async (done) => {
  request
  db = await createTypeOrmConn();
  await request(process.env.HOST as string, mutation(goodEmail, goodPassword))  
  const users = await User.find({ where: { goodEmail } });
  userId = users[0].id;
  done();
});

afterAll(() => db.close());

describe('Feature: Email Confirmation - Success', () => {
  test('Clicking on a Confirmation Email link returns "ok"', async (done) => {
    goodUrl = await createConfirmEmailLink((<string>process.env.HOST), userId, redis);
    const response = await fetch(goodUrl);
    const text = await response.text();
    expect(text).toEqual('ok');
    done();
  });
  test('AND User is confirmed in the Postgres Database', async (done) => {
    const user = await User.findOne({ where: { id: userId } });
    expect((<User>user).confirmed).toBeTruthy();
    done();
  });
  test('AND UserID is removed from the Redis Database', async (done) => {
    const chunks = goodUrl.split('/');
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
    done();
  });
});
