import "reflect-metadata";
import { startServer } from "./startServer";
import { createTypeOrmConn } from "./startTypeOrm";

startServer();
createTypeOrmConn();
