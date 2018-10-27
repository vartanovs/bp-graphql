import * as bcrypt from 'bcryptjs';

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';

import GQL from '../../types/schema';
import { errorMessages } from './errorMessages';

const invalidLoginError = [{
  path: 'email',
  message: errorMessages.invalidLogin,
}];

export const resolvers: ResolverMap = {
  Query: {
    workaround2: () => 'workaround2',
  },
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session },
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) return invalidLoginError;

      const validPass = await bcrypt.compare(password, user.password);

      if (!validPass) return invalidLoginError;

      if (!user.confirmed) {
        return [{
          path: 'confirmed',
          message: errorMessages.unconfirmedEmail,
        }];
      }

      // Login Successful > Start Session
      session.userId = user.id;

      return null;
    }
  }
}