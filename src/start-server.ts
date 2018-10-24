import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { GraphQLServer } from 'graphql-yoga';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';

import * as fs from 'fs';
import * as path from 'path';

import { createTypeOrmConn } from "./utils/createTypeOrmConn";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, './modules'));
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`))
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
  })
  
  const server= new GraphQLServer({ schema: mergeSchemas({ schemas }) });
  
  await createTypeOrmConn();
  const app = await server.start({ port: process.env.NODE_ENV === 'test' ? 0 : 4000 });
  const appAddress: any = app.address(); // TODO: Specify type for appAddress
  console.log(`Server is running on localhost:${appAddress.port}`);

  return app;
};
