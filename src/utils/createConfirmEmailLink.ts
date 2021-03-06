import { Redis } from 'ioredis';
import { v4 } from 'uuid';

// Confirm Email Link - https://url/confirm/<id>

/**
 * Generate a custom link for user to confirm their email
 * @param {string} url Domain URL user clicked on to register (ex: localhost:4000)
 * @param {string} userId User ID stored in PSQL Database
 * @param {Redis} redis Redis object for session storage
 * @returns Custom URL with UUID
 */
export const createConfirmEmailLink = async (
    url: string,
    userId: string,
    redis: Redis
    ) => {
      // Generate random UUID
      const id = v4();
      // Write session to Redis for 24 hours (60s * 60m * 24h)
      await redis.set(id, userId, 'ex', 66 * 60 * 24);
      // Return URL for Email Confirmation to send to user
      return `${url}/confirm/${id}`;
    };
