import { GraphQLSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';

import * as fs from 'fs';
import * as path from 'path';

export const genSchema = () => {
  // Declare empty array to hold GraphQL Schemas
  const schemas: GraphQLSchema[] = [];
  // Create folders array which holds the names of all module folders
  const folders: string[] = fs.readdirSync(path.join(__dirname, '../modules'));
  // Loop through folders, pushing an executable schema (resolver + typedef) into schemas array
  folders.forEach((folder) => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname, `../modules/${folder}/schema.graphql`))
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
  })
  // Merge schemas as return
  return mergeSchemas({ schemas })
}