const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Store Auth API',
      version: '1.0.0',
      description: 'Authentication API with JWT'
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1'
      }
    ]
  },
  apis: ['../routes/**/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
