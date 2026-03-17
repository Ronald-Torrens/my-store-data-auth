const request = require('supertest');
const app = require('../app'); // ajusta ruta

describe('Auth Flow', () => {

  let refreshToken;

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

    // guardamos el nuevo
    refreshToken = res.body.refreshToken;
  });

  it('should fail with old refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'token_viejo_fake' });

    expect(res.statusCode).toBe(401);
  });

});
