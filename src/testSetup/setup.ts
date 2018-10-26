import { startServer } from "../start-server";
import { createTypeOrmConn } from "../utils/createTypeOrmConn";

import { Connection } from 'typeorm';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

// TODO: Specify type for dbConnection
export let app: HttpServer | HttpsServer;
export let db: Connection;

export const setup = async () => {
  app = await startServer();
  db = await createTypeOrmConn();
  return { app, db }
  // done();
};