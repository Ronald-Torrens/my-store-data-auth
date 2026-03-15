const boom = require('@hapi/boom');
const { ValidationError } = require('sequelize');

function logErrors (err, req, res, next) {
  //console.error(err);
  next(err);
};

function errorHandler (err, req, res, next) {
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
};

function boomErrorHandler (err, req, res, next) {
  if(err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  };
};

function sqlErrorHandler (err, req, res, next) {
  if (err instanceof ValidationError) {
    throw boom.conflict(err.errors[0].message)
  }
  next(err)
}

module.exports = { logErrors, errorHandler, boomErrorHandler, sqlErrorHandler };
