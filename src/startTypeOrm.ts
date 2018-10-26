import { createConnection, getConnectionOptions } from 'typeorm';

export const createTypeOrmConn = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  const connection = await createConnection({ ...connectionOptions, name: "default" });
  console.log('Connecting to Type ORM');
  return connection;
};
