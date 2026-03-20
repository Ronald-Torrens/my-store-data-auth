const boom = require('@hapi/boom');
const { config } = require('../config/config');
const { compareData } = require('../utils/security/hash');

// Protege la API con una clave global (opcional)
async function checkApiKey ( req, res, next ) {
  const apiKey = req.headers['api'];
  const isMatch = await compareData(apiKey, config.apiKey);
  if ( isMatch ) {
    next();
  } else {
    next( boom.unauthorized() );
  };
};

// Middleware flexible para roles
function checkRoles ( ...roles ) {
  return ( req, res, next ) => {
    const user = req.user;
    if ( user && roles.includes(user.role) ) {
      next();
    } else {
      next( boom.unauthorized() );
    };
  };
};

// Middleware para recurso propio o admin
const checkOwnershipOrAdmin = (paramIdField = 'id') => {
  return (req, res, next) => {
    const user = req.user;
    const resourceId = Number(req.params[paramIdField]);

    if (user.role === 'admin' || user.sub === resourceId) {
      return next();
    }

    next(boom.forbidden('You do not have permission'));
  };
};

module.exports = { checkApiKey, checkRoles, checkOwnershipOrAdmin };
