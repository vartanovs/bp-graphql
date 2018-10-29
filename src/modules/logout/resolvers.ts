import { ResolverMap } from "../../@types/graphql-utils";
import { removeAllUsersSessions } from "../../utils/removeAllUsersSessions";

export const resolvers: ResolverMap = {
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      // Extract User ID from session
      const { userId } = session;

      // If User ID found, remove all sessions (all devices)
      if (userId) {
        removeAllUsersSessions(userId, redis);
        return true;
      }

      // If no User ID found, return false
      return false;
    },
  },
}