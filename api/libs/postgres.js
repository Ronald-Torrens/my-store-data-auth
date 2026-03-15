
const { Client } = require('pg');
require('dotenv').config();

async function getConnection() {
  try {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: process.env.PG_USER,
      password: process.env.PG_PASS,
      database: process.env.PG_DB
    });
    await client.connect();
    return client;

  } catch (error) {
    console.error(error);
  };
};

module.exports = getConnection;
