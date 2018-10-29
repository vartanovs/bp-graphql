import { AddressInfo } from 'net';
import { GraphQLServer } from 'graphql-yoga';
import { Response } from 'express';

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import * as RateLimit from 'express-rate-limit';
import * as RateLimitRedisStore from 'rate-limit-redis';
import * as passport from 'passport';
import { OAuth2Strategy as Strategy } from 'passport-google-oauth';

import { redis } from './startRedis';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/genSchema';
import { redisSessionPrefix } from './constants';
import { User } from './entity/User';

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
    // Pass redis, request/session and url as context to use in resolvers
    context: ({ request }) => ({
      redis,
      request,
      session: request.session,
      url: request.protocol + '://' + request.get('host'),
    }),
  });

  // Middleware for rate limiting
  server.express.use(
    new RateLimit({
      delayMs: 0, // No delaying, full speed until max limit is reached
      max: 100, // Limit to 100 requests within the window
      store: new RateLimitRedisStore({
        client: redis,
      }), // Store rate limit records in redis
      windowMs: 15 * 60 * 1000, // 15 minutes (60s * 15m * 1000ms)
    })
  )

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
      secret: <string>process.env.SESSION_SECRET,
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix,
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );
  
  // Declaration to enable CORS
  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === 'test' ? '*' : <string>process.env.FRONTEND_HOST,
  }

  // Google oAuth Strategy
  passport.use(new Strategy({
    clientID: <string>process.env.GOOGLE_CLIENT_ID ,
    clientSecret: <string>process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/auth/google/callback',
  }, async (_, __, profile, cb) => {
    // Retrieve Google ID and Email from Google profile
    let email: string;
    const { id, emails } = profile;
    if (emails) {
      // Extract email (if exists) and search for corresponding user
      email = emails[0].value;
      const user = await User.findOne({ email })

      if (!user) {
        // If user not found, register user
        await User.create({
          email,
          googleId: id,
        }).save();
      } else {
        // If user is found, add Google ID
        user.googleId = id;
        await user.save();
      }
      // Proceed to callback URL, passing along Google ID as req.user.id
      return cb(null, { id: (<User>user).id});
    }
  }));

  // Initialize Passport for oAuth and Callback endpoints
  server.express.use(passport.initialize());

  // If user hits oAuth endpoint, redirect to Google for authentication
  server.express.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], }));

  // If user hits callback endpoint, set session using Google ID and redirect
  server.express.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/',
      successRedirect: '/',
      session: false
    }),
    (req, res) => {
      // Retrieve id from req.user (passed in during oAuth) and add to session
      (<Express.Session>req.session).userId = req.user.id;
      // TODO: Successful authentication - redirect home
      res.redirect('/');
    });

  // Start Server and assign server object to const 'app'. Port determined by ENV.
  const app = await server.start({ cors, port: process.env.NODE_ENV === 'test' ? 0 : 4000 });

  // Extract address object from server object and log address.port
  const appAddress: AddressInfo | string = app.address();
  const { port } = (<AddressInfo>appAddress);
  process.env.HOST = `http://127.0.0.1:${port}`;
  console.log(`Server is running on localhost:${port}`);

  // Return server object.
  return app;
};
