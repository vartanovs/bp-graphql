import { Redis } from 'ioredis';
import { v4 } from 'uuid';

// Confirm Email - https://url/confirm/<id>

/**
 * Generate a custom Email Link for user to confimr their password
 * @param {string} url Domain URL user clicked on to register (ex: localhost:4000)
 * @param {string} userId User ID stored in PSQL Database
 * @param {Redis} redis Redis object for session storage
 * @returns Custom URL with UUID
 */
export const createConfirmEmailLink = async (url: string, userId: string, redis: Redis) => {
  // Generate random ID
  const id = v4();
  // Write session to Redis for 24 hours (60s * 60m * 24h)
  await redis.set(id, userId, 'ex', 66 * 60 * 24);
  // Return URL for u
  return `${url}/confirm/${id}`;
};
