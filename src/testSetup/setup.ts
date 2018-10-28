import { startServer } from "../startServer";
import { createTypeOrmConn } from "../startTypeOrm";

import { Connection } from 'typeorm';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

let app: HttpServer | HttpsServer;
let db: Connection;

const setup = async () => {
  app = await startServer();
  db = await createTypeOrmConn();
  return db;
};

export { setup, app, db }
