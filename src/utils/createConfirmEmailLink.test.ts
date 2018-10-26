import * as Redis from 'ioredis';
import fetch from 'node-fetch';

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeOrmConn } from "./createTypeOrmConn";
import { startServer } from '../start-server';
import { Connection } from 'typeorm';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { User } from "../entity/User";

let app: HttpServer | HttpsServer;
let db: Connection;
let badUrl: string;
let goodUrl: string;
let userId: string;

const goodEmail: string = 'test1@test.com';
const goodPassword: string = 'secretpass';
const redis: Redis.Redis = new Redis();

beforeAll(async (done) => {
  app = await startServer();
  db = await createTypeOrmConn();
  const user = await User.create({
    email: goodEmail,
    password: goodPassword,
  }).save();
  userId = user.id;
  done();
});

afterAll(async (done) => {
  await db.close();
  await app.close();
  done();
});

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

describe('Feature: Email Confirmation - Failure', () => {
  test('Clicking on an Invalid Confirmation Email link returns "invalid"', async (done) => {
    badUrl = `${(<string>process.env.HOST)}/confirm/12345abcde`;
    const response = await fetch(badUrl);
    const text = await response.text();
    expect(text).toEqual('invalid');
    done();
  });
});