import { ResolverMap } from "../../types/graphql-utils";
import { userSessionIdPrefix, redisSessionPrefix } from "../../constants";

export const resolvers: ResolverMap = {
  Query: {
    workaround3: () => 'workaround3'
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;

      if (userId) {
        // Retrieve all session IDs from redis (from start(0) to end(-1) of array)
        const sessionIds = await redis.lrange(`${userSessionIdPrefix}${userId}`, 0, -1);

        // Create array of deletion promises for Promise.all
        const delPromises = [];

        // Loop through session IDs, deleting each one
        for(let i = 0; i < sessionIds.length; i += 1) {
          delPromises.push(redis.del(`${redisSessionPrefix}${sessionIds[i]}`));
        }
        
        // Run all deletions in parallel
        await Promise.all(delPromises);
        return true;
      }

      // If no userID, return false
      return false;
    },
  },
}