const rateLimit = require('express-rate-limit');

const WINDOW_MINUTES = 15;

const createLimiter = (windowMinutes, maxRequests, message) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message
  });
};


const loginLimiter = createLimiter(
  WINDOW_MINUTES,
  5,
  'Too many login attempts, try again later.'
);

const recoveryLimiter = createLimiter(
  WINDOW_MINUTES,
  3,
  'Too many requests, try again later.'
);

const changePasswordLimiter = createLimiter(
  WINDOW_MINUTES,
  3,
  'Too many requests, try again later.'
);

module.exports = { loginLimiter, recoveryLimiter, changePasswordLimiter };
