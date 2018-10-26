require('ts-node/register');

// Reference TS teardown module via require:
const { teardown } = require('./teardown');

module.exports = async () => {
  await teardown();
  return null;
};
