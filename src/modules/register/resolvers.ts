import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';

import { ResolverMap } from "../../types/graphql-utils";
import { User } from '../../entity/User';

import GQL from '../../types/schema';

import { errorMessages } from './errorMessages';
import { formatYupError } from '../../utils/formatYupError';

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
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
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
      await user.save();
      return null;
    }
  }
};
