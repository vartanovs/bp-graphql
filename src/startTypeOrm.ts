import { createConnection, getConnectionOptions } from 'typeorm';

// Connect to TypeORM - See also testUtils/createTestConn for Test Environment Connection
export const createTypeOrmConn = async () => {
  // Retrieve connection options for current NODE_ENV
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  // Create Connection with these options, changing 'name' to 'default' and return connection
  const connection = await createConnection({ ...connectionOptions, name: "default" });
  console.log('Connecting to Type ORM');
  return connection;
};
