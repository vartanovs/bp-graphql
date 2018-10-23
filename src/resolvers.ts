import { ResolverMap } from "./types/graphql-utils";
import { User } from './entity/User';
import * as bcrypt from 'bcryptjs';

import GQL from './types/schema';

const SALT = 12;

export const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) => `Hello ${name || 'world'}`
  },
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      const hashPassword = await bcrypt.hash(password, SALT);
      await User.create({
        email,
        password: hashPassword
      })
      return true;
    }
  }
};
