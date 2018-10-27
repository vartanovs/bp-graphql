import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';

import { ResolverMap } from "../../types/graphql-utils";
import { User } from '../../entity/User';

import GQL from '../../types/schema';

import { errorMessages } from './errorMessages';
import { formatYupError } from '../../utils/formatYupError';
import { createConfirmEmailLink } from '../../utils/createConfirmEmailLink';
import { sendEmail } from '../../utils/sendEmail';

const SALT = 12;

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, errorMessages.emailTooShort)
    .max(255)
    .email(errorMessages.emailInvalid),
  password: yup
    .string()
    .min(3, errorMessages.passwordTooShort)
    .max(255)
});

export const resolvers: ResolverMap = {
  // Bug w/graphql-tools - query required for all schemas/resolvers
  Query: {
    workaround: () => 'workaround',
  },

  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
      // Validate arguments
      try {
        await schema.validate(args, {abortEarly: false});
      } catch (err) {
        return formatYupError(err);  
      }

      // Destructure email and password from arguments
      const { email, password } = args;

      // Check if user has already registered - if so, return error array
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userAlreadyExists) {
        return [
          {
            path: 'email',
            message: errorMessages.duplicateEmail,
          },
        ];
      }

      // Hash password and save user to database, return null (no errors)
      const hashPassword = await bcrypt.hash(password, SALT);
      const user = User.create({
        email,
        password: hashPassword
      });

      // Save user to database
      await user.save();

      // Create 'Confirm Email' url to send to user
      const confirmEmailLink = await createConfirmEmailLink(url, user.id, redis);

      // Dispatch confirmation email to user (if not in test environment)
      if (process.env.NODE_ENV !== 'test') {
        await sendEmail(email, confirmEmailLink);
      } else {
        console.log('Note - Test Env - SparkPost Email Not Sent')
      }

      return null;
    }
  }
};
