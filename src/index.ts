import "reflect-metadata";
import { startServer } from "./start-server";
import { createTypeOrmConn } from "./utils/createTypeOrmConn";

startServer();
createTypeOrmConn();
