import { Redis } from "ioredis";
import { Request } from "express";

// Type specification for Resolver and Context
export interface Context {
  redis: Redis,
  request: Request,
  url: string,
  session: Session,
};

export type Resolver = (
  parent: any,
  args: any,
  context: Context,
  info: any,
  ) => any;

export type GraphQLMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any,
  ) => any;

export interface Session extends Express.Session {
  userId?: string;
};

// Type specification for Resolver Map
export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver,
  }
};
