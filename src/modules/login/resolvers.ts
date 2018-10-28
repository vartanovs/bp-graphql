import * as bcrypt from 'bcryptjs';

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';

import GQL from '../../types/schema';
import { userSessionIdPrefix } from '../../constants';
import { errorMessages } from '../../utils/errorMessages';

const invalidLoginError = [{
  path: 'email',
  message: errorMessages.login.invalidLogin,
}];

export const resolvers: ResolverMap = {
  Query: {
    workaround2: () => 'workaround2',
  },
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, request},
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) return invalidLoginError;

      const validPass = await bcrypt.compare(password, user.password);

      if (!validPass) return invalidLoginError;

      if (!user.confirmed) {
        return [{
          path: 'confirmed',
          message: errorMessages.login.unconfirmedEmail,
        }];
      }

      if (user.forgotPasswordLocked) {
        return [{
          path: 'locked',
          message: errorMessages.login.lockedAccount,
        }]
      }

      // Login Successful > Start Session and add to redis array
      session.userId = user.id;
      if (request.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, request.sessionID);
      }

      return null;
    }
  }
}