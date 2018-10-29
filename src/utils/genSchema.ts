// import { GraphQLSchema } from 'graphql';
// import { importSchema } from 'graphql-import';
// import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';

import { mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import { makeExecutableSchema } from 'graphql-tools';

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// export const genSchema = () => {
//   // Declare empty array to hold GraphQL Schemas
//   const schemas: GraphQLSchema[] = [];
//   // Create folders array which holds the names of all module folders
//   const folders: string[] = fs.readdirSync(path.join(__dirname, '../modules'));
//   // Loop through folders, pushing an executable schema (resolver + typedef) into schemas array
//   folders.forEach((folder) => {
//     const { resolvers } = require(`../modules/${folder}/resolvers`);
//     const typeDefs = importSchema(path.join(__dirname, `../modules/${folder}/schema.graphql`))
//     schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
//   })
//   // Merge schemas as return
//   return mergeSchemas({ schemas })
// }

export const genSchema = () => {
  // Declare filepath to modules folder
  const pathToModules = path.join(__dirname, '../modules');

  // Read all .graphql files synchronously to graphqlTypes as an array of strings
  const graphqlTypes = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map(x => fs.readFileSync(x, { encoding: 'utf8' }));
  
  // Require all exported resolvers from all resolvers.?s files
  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map(resolver => require(resolver).resolvers);
  
  // Generate and return an executable schema from merged typeDefs and merged resolvers
  return makeExecutableSchema({
    typeDefs: mergeTypes(graphqlTypes),
    resolvers: mergeResolvers(resolvers),
  })
};
