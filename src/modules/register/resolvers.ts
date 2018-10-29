import * as yup from 'yup';

import { ResolverMap } from "../../@types/graphql-utils";
import { User } from '../../entity/User';

import GQL from '../../@types/schema';

import { formatYupError } from '../../utils/formatYupError';
import { createConfirmEmailLink } from '../../utils/createConfirmEmailLink';
import { sendEmail } from '../../utils/sendEmail';
import { errorMessages } from '../../utils/errorMessages';
import { passwordValidation } from '../../yupSchemas';

// Validate schema for registration email and password inputs
const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, errorMessages.register.emailTooShort)
    .max(255)
    .email(errorMessages.register.emailInvalid),
  password: passwordValidation,
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
      // Validate email and password inputs and throw errors if  invalid
      try {
        await schema.validate(args, {abortEarly: false});
      } catch (err) {
        return formatYupError(err);  
      }

      // Destructure email and password from arguments
      const { email, password } = args;

      // Check if user has already registered - if so, return error
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userAlreadyExists) {
        return [
          {
            path: 'email',
            message: errorMessages.register.duplicateEmail,
          },
        ];
      }

      // Create and save user to database, return null (no errors)
      const user = await User.create({
        email,
        password, // Hash log in User Entity
      }).save();

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
