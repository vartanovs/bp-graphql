import { createConnection, getConnectionOptions } from 'typeorm';

export const createTypeOrmConn = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  console.log('Connecting to Type ORM');
  return await createConnection({ ...connectionOptions, name: "default" });
};
