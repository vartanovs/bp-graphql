import { Redis } from "ioredis";
import { userSessionIdPrefix, redisSessionPrefix } from "../constants";

export const removeAllUsersSessions = async (userId: string, redis: Redis) => {
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
};
