import { v4 } from 'uuid';
import { Redis } from 'ioredis';
import { forgotPasswordPrefix } from '../constants';

// Change Password Link - https://url/change-password/<id>

/**
 * Generate a custom link for user to change their password
 * @param {string} url Domain URL user clicked on to register (ex: localhost:4000)
 * @param {string} userId User ID stored in PSQL Database
 * @param {Redis} redis Redis object for session storage
 * @returns Custom URL with UUID
 */

export const createForgotPasswordLink = async (
  url: string,
  userId: string,
  redis: Redis,
  ) => {
    // Generate random UUID
    const id = v4();
    // Write session to Redis for 20 minutes (60s * 20m)
    await redis.set(`${forgotPasswordPrefix}${id}`, userId, 'ex', 60 * 20);
    // Return URL for Email Confirmation to send to user
    return `${url}/change-password/${id}`;
  };
