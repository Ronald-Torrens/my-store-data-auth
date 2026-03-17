const request = require('supertest');
const app = require('../app');

const { models } = require('../libs/sequelize');
const sequelize = require('../libs/sequelize');
const bcrypt = require('bcrypt');

let refreshToken;
let testUser;

beforeAll(async () => {
  const hash = await bcrypt.hash('12345678', 10);

  testUser = await models.User.create({
    email: 'test@test.com',
    password: hash,
    role: 'customer'
  });
});

describe('Auth Flow', () => {

  it('should login and return tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: '12345678'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    refreshToken = res.body.refreshToken;
  });

  it('should refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    refreshToken = res.body.refreshToken;
  });

  it('should fail with old refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'token_viejo_fake' });

    expect(res.statusCode).toBe(401);
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'wrongpass'
      });

    expect(res.statusCode).toBe(401);
  });

  it('should fail without email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        password: '12345678'
      });

    expect(res.statusCode).toBe(400);
  });

});

afterAll(async () => {
  await models.User.destroy({
    where: { email: 'test@test.com' }
  });

  await sequelize.close();
});
