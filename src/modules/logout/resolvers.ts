import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    workaround3: () => 'workaround3'
  },
  Mutation: {
    logout: (_, __, { session }) => new Promise(resolve => {
      session.destroy((err) => {
        if (err) console.error('Error: Logout Error - ', err);
        else resolve(true);
      });
    }),
  },
}