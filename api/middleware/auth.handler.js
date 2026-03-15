
const boom = require('@hapi/boom');

const { config } = require('../config/config');

function checkApiKey ( req, res, next ) {
  const apiKey = req.headers['api'];
  if ( apiKey === config.apiKey ) {
    next();
  } else {
    next( boom.unauthorized() );
  };
};

// Para verificar el role de Administrador, importante para las opciones que permiten editar datos.
function checkAdminRole ( req, res, next ) {
  const user = req.user;
  //console.log(req.user);
  if ( user && user.role === 'admin' ) {
    next();
  } else {
    next( boom.unauthorized() );
  };
};

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

module.exports = { checkApiKey, checkAdminRole, checkRoles };
