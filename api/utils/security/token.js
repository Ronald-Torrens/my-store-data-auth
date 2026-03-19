const jwt = require('jsonwebtoken');
const { config } = require('../../config/config');

const signToken = (payload, expires, secret = config.jwtSecret) => {
  return jwt.sign(payload, secret, {
    expiresIn: expires
  });
};

const verifyToken = (token, secret = config.jwtSecret) => {
  return jwt.verify(token, secret);
};

module.exports = { signToken, verifyToken };
