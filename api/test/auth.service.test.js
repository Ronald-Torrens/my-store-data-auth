const AuthService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

jest.mock('../services/users.service', () => {
  return jest.fn().mockImplementation(() => {
    return {
      update: jest.fn(),
      findOneWithRefreshToken: jest.fn()
    };
  });
});

describe('AuthService', () => {

  let service;

  beforeEach(() => {
    service = new AuthService();
  });

  it('should generate access and refresh tokens', async () => {

    const fakeUser = {
      id: 1,
      role: 'customer',
      toJSON: () => ({ id: 1, role: 'customer' })
    };

    jwt.sign.mockReturnValue('fake-token');

    const result = await service.signToken(fakeUser);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

});
