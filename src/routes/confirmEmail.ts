import { Request, Response, NextFunction } from 'express';

import { User } from '../entity/User';

import { redis } from '../startRedis';

export const confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
  // Retrieve UUID from URL and use to find User ID in Redis
  const { id } = req.params;
  const userId = await redis.get(id);
  if (userId) {
    // If User ID found, update Postres record to set confirmed to true
    await User.update({ id: userId }, { confirmed: true });
    // Remove record from Redis and return 'ok'
    await redis.del(id);
    next();
  } else {
    // If user not found, send 'invalid'
    res.send('invalid');
  }
};
