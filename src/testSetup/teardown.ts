const { app, db } = require('./setup');

export const teardown = async () => {
  await db.close();
  await app.close();
  return null;
  // done();
};
