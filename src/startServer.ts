import { AddressInfo } from 'net';

import { GraphQLSchema } from 'graphql';
import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';

import * as fs from 'fs';
import * as path from 'path';

import { redis } from './startRedis';
import { confirmEmail } from './routes/confirmEmail';
import { Response } from 'express';

// import { createTypeOrmConn } from './utils/createTypeOrmConn';

/**
 * Generate and return a server object
 * TODO: Refactor to remove side-effects
 */
export const startServer = async () => {
  // Declare empty array to hold GraphQL Schemas
  const schemas: GraphQLSchema[] = [];
  // Create folders array which holds the names of all module folders
  const folders: string[] = fs.readdirSync(path.join(__dirname, './modules'));
  // Loop through folders, pushing an executable schema (resolver + typedef) into schemas array
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`))
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
  })

  // Establish new GraphQL Server (graphql-yoga)
  const server= new GraphQLServer({
    // Pass merged executable schemas as schema
    schema: mergeSchemas({ schemas }),
    // Pass redis and url as context to use in resolver
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host')
    }),
  });

  // Express GET endpoint for Email Confirmation Link
  server.express.get('/confirm/:id',
    confirmEmail,
    (_, res: Response) => res.send('ok'));

  // Start Server and assign server object to const 'app'. Port determined by ENV.
  const app = await server.start({ port: process.env.NODE_ENV === 'test' ? 0 : 4000 });

  // Extract address object from sever object and log address.port
  const appAddress: AddressInfo | string = app.address();
  const { port } = (<AddressInfo>appAddress);
  process.env.HOST = `http://127.0.0.1:${port}`;
  console.log(`Server is running on localhost:${port}`);

  // Return server object.
  return app;
};
