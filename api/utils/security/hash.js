const bcrypt = require('bcrypt');

const hashData = async (data) => {
  return await bcrypt.hash(data, 10);
};

const compareData = async (data, hash) => {
  return await bcrypt.compare(data, hash);
};

module.exports = { hashData, compareData };
