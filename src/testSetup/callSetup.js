require('ts-node/register');

// Reference TS teardown module via require:
const { setup } = require('./setup');

module.exports = async () => {
  await setup();
  return null;
};
