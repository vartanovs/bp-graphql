import { Redis } from "ioredis";
import { removeAllUsersSessions } from "./removeAllUsersSessions";
import { User } from "../entity/User";

export const forgotPasswordLockAccount = async (userId: string, redis: Redis) => {
  // Lock account so user cannot login
  await User.update({ id: userId }, { forgotPasswordLocked: true })
  
  // Remove all active sessions
  await removeAllUsersSessions(userId, redis);
}
