import { AddressInfo } from 'net';
import { GraphQLServer } from 'graphql-yoga';

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import * as session from 'express-session';
import * as connectRedis from 'connect-redis';

import { redis } from './startRedis';
import { confirmEmail } from './routes/confirmEmail';
import { Response } from 'express';
import { genSchema } from './utils/genSchema';

const SESSION_SECRET = process.env.SESSION_SECRET;
const RedisStore = connectRedis(session);

/**
 * Generate and return a server object
 * TODO: Refactor to remove side-effects
 */
export const startServer = async () => {
  // Establish new GraphQL Server (graphql-yoga)
  const server= new GraphQLServer({
    // Pass merged executable schemas as schema
    schema: genSchema(),
    // Pass redis and url as context to use in resolver
    context: ({ request }) => ({
      redis,
      session: request.session,
      url: request.protocol + '://' + request.get('host'),
    }),
  });

  // Express GET endpoint for Email Confirmation Link
  server.express.get('/confirm/:id',
    confirmEmail,
    (_, res: Response) => res.send('ok'));

  // Express GET endpoint for Session
  server.express.use(
    session({
      name: 'sessionID',
      resave: false,
      saveUninitialized: false,
      secret: <string>SESSION_SECRET,
      store: new RedisStore({
        client: redis as any,
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === 'test' ? '*' : <string>process.env.FRONTEND_HOST,
  }

  // Start Server and assign server object to const 'app'. Port determined by ENV.
  const app = await server.start({ cors, port: process.env.NODE_ENV === 'test' ? 0 : 4000 });

  // Extract address object from sever object and log address.port
  const appAddress: AddressInfo | string = app.address();
  const { port } = (<AddressInfo>appAddress);
  process.env.HOST = `http://127.0.0.1:${port}`;
  console.log(`Server is running on localhost:${port}`);

  // Return server object.
  return app;
};
