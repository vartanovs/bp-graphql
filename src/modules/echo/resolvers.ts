import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { createMiddleWare } from '../../utils/createMiddleware';
import middleware from './middleware';

// Use a session to retrieve a user from the database (whose id matches the session userId)
export const resolvers: ResolverMap = {
  Query: {
    echo: createMiddleWare(middleware, (_, __, { session }) => 
      User.findOne({ where: { id: session.userId} }),
    )
  },
};
