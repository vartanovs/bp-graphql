import * as bcrypt from 'bcryptjs';

import { ResolverMap } from "../../types/graphql-utils";
import { User } from '../../entity/User';

import GQL from '../../types/schema';

const SALT = 12;

export const resolvers: ResolverMap = {
  // Bug w/graphql-tools - query required for all schemas/resolvers
  Query: {
    workaround: () => 'workaround',
  },

  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      // Check if user has already registered - if so, return error array
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userAlreadyExists) {
        return [
          {
            path: 'email',
            message: 'already taken',
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
