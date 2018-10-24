import "reflect-metadata";
import { createConnection } from "typeorm";
import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as path from 'path';
import { resolvers } from './resolvers';

export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, './schema.graphql'));
  
  const server= new GraphQLServer({ typeDefs, resolvers });
  
  await createConnection();
  await server.start();
  console.log('Server is running on localhost:4000');
};

startServer();
