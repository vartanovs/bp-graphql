import { Connection } from 'typeorm';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

import { startServer } from "../startServer";
import { createTestConn } from "./createTestConn";

let app: HttpServer | HttpsServer;
let db: Connection;

// Activate Server and TypeOrm Connection prior to testing
const setup = async () => {
  app = await startServer();
  db = await createTestConn(true);
  return db;
};

export { setup, app, db }
