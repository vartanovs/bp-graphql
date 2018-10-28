import * as yup from 'yup';
import * as bcrypt from 'bcryptjs';
import { errorMessages } from '../../utils/errorMessages';
import { ResolverMap } from '../../types/graphql-utils';

import GQL from '../../types/schema';
import { forgotPasswordLockAccount } from '../../utils/forgotPasswordLockAccount';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import { User } from '../../entity/User';
import { forgotPasswordPrefix } from '../../constants';
import { passwordValidation } from '../../yupSchemas';
import { formatYupError } from '../../utils/formatYupError';

const SALT = 12;

const schema = yup.object().shape({
  newPassword: passwordValidation
});

export const resolvers: ResolverMap = {
  Query: {
    workaround4: () => 'workaround4'
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email }});

      // If user not found (by email), return error message
      if (!user) return [
        {
          path: 'email',
          message: errorMessages.forgotPassword.invalidEmail,
        }
      ]

      // If user found, lock account and generate 'forgot password' link
      await forgotPasswordLockAccount(user.id, redis);
      // TODO: Add Frontend URL
      await createForgotPasswordLink('', user.id, redis);
      // TODO: Send Email with URL
      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const userId = await redis.get(`${forgotPasswordPrefix}${key}`);

      // If key is not associated with User Id, return error message
      if (!userId) {
        return [
          {
            path: 'key',
            message: errorMessages.forgotPassword.invalidKey,
          },
        ];
      }
      
      // If password does not meet validation criteria, return error message
      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      // If key and password are valid, hash password and update user record
      newPassword = await bcrypt.hash(newPassword, SALT);
      await User.update({ id: userId }, {
        password: newPassword,
        forgotPasswordLocked: false,
      })

      // Once account has been updated, key should expire
      await redis.del(`${forgotPasswordPrefix}${key}`)

      return true;
    }
  }
}