
const express = require('express');
const cors = require('cors');
const routerApi = require('./routes');
const { checkApiKey } = require('./middleware/auth.handler');

const { errorHandler, logErrors, boomErrorHandler, sqlErrorHandler } = require('./middleware/error.handler');

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

/**/
const whitelist = ['http://127.0.0.1:5500', 'https://myapp.co'];
const options = {
  origin: (origin, callback) => {
    if( whitelist.includes(origin) || !origin ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed.'), false);
    }
  }
}
app.use(cors(options));

//app.use(cors()); // Sólo para usar con Glitch

require('./utils/auth'); // Ejecuta estrategia de autenticación

app.get('/api', checkApiKey, (req, res) => {
  res.send(`<h1>Server with Express.js, data persistence with PostgreSQL and Authentication with JWT...</h1>`);
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

routerApi(app);

app.use(logErrors);
app.use(sqlErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`✅ App is running on the port: ${port}.`);
});
