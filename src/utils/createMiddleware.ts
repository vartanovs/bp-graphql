import { Resolver, GraphQLMiddlewareFunc } from "../@types/graphql-utils";

// Accept a middleware function and resolver function
// Return invocation of the middelware function with resolver passed in
export const createMiddleWare = (
  middlewareFunc: GraphQLMiddlewareFunc,
  resolverFunc: Resolver
  ) => (
    parent: any,
    args: any,
    context: any,
    info: any
    ) => middlewareFunc(
      resolverFunc,
      parent,
      args,
      context,
      info
      );
