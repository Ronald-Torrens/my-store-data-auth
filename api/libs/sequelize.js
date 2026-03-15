const { Sequelize } = require('sequelize');
const { config } = require('../config/config');
const setupModels = require('../db/models/index');

/* En producción no necesito construir la URL

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
//const URI = `mysql://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
*/

// Configuración Sequelize
const options = {
  dialect: 'postgres',
  logging: config.isProd ? false : console.log, // Logging solo en dev
};

// SSL en producción (Railway, Render, Heroku)
if (config.isProd) {
  options.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

// Crear instancia de Sequelize
const sequelize = new Sequelize(config.dbUrl, options);

// Inicializar modelos
setupModels(sequelize);

module.exports = sequelize;
