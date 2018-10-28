import { ResolverMap } from "../../types/graphql-utils";
import { removeAllUsersSessions } from "../../utils/removeAllUsersSessions";

export const resolvers: ResolverMap = {
  Query: {
    workaround3: () => 'workaround3'
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;

      if (userId) {
        removeAllUsersSessions(userId, redis);
        return true;
      }

      // If no userID, return false
      return false;
    },
  },
}