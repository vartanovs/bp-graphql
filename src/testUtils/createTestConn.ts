import { getConnectionOptions, createConnection } from "typeorm";

// Connect to TypeORM for Testing - See also ../startTypeOrm for Dev/Prod Environment Connection
export const createTestConn = async ( resetDB: boolean = false ) => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);

  // Drop schema only if user passes in resetDB: true
  return createConnection({
    ...connectionOptions,
    name: 'default',
    synchronize: resetDB,
    dropSchema: resetDB,
  })
};
