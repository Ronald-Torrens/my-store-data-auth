const AuthService = require('../services/auth.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

jest.mock('jsonwebtoken');

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

const fakeUserService = {
  update: jest.fn(),
  findOneWithRefreshToken: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findByEmail: jest.fn(),
  findOneWithRecoveryToken: jest.fn()
};

const fakeMailService = {
  sendMail: jest.fn()
};

describe('AuthService', () => {

  let service;

  beforeEach(() => {
    service = new AuthService(fakeUserService, fakeMailService);

    jest.clearAllMocks();

  });

  // Test para signToken: generar token y refrescarlo:
  it('should generate access and refresh tokens', async () => {

    const fakeUser = {
      id: 1,
      role: 'customer',
      toJSON: () => ({ id: 1, role: 'customer' })
    };

    jwt.sign.mockReturnValue('fake-token');

    const result = await service.signToken(fakeUser);

    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(result.refreshToken).toBeDefined();
  });

  // Test para verifiar error por uso de refreshToken inválido:
  it('should throw error for invalid refresh token', async () => {

    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await expect(service.refreshToken('bad-token'))
      .rejects
      .toThrow();
  });

  // Test para verifiar retorno correcto de la contraseña:
  it('should return user if password is correct', async () => {

    const fakeUser = {
      id: 1,
      password: 'hashed-password'
    };

    service.userService.findByEmailWithPassword.mockResolvedValue(fakeUser);

    bcrypt.compare.mockResolvedValue(true);

    const result = await service.getUser('test@test.com', '123456');

    expect(result).toEqual(fakeUser);
  });

  // Test para verifiar error por contraseña incorrecta:
  it('should throw error if password is wrong', async () => {

    const fakeUser = {
      id: 1,
      password: 'hashed-password'
    };

    service.userService.findByEmailWithPassword.mockResolvedValue(fakeUser);

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      service.getUser('test@test.com', 'wrong')
    ).rejects.toThrow();
  });

  // Test para verifiar error por usuario incorrecto:
  it('should throw error if user does not exist', async () => {

    service.userService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.getUser('null')
    ).rejects.toThrow();
  });

  // Test para verifiar si el usuario NO existe:
  it('should throw error if user not found in refreshToken', async () => {

    jwt.verify.mockReturnValue({ sub: 1 });

    service.userService.findOneWithRefreshToken.mockResolvedValue(null);

    await expect(
      service.refreshToken('valid-token')
    ).rejects.toThrow();

  });

  // Test para verifiar si el refreshToken NO coincide:
  it('should throw error if refresh token does not match', async () => {

    jwt.verify.mockReturnValue({ sub: 1 });

    service.userService.findOneWithRefreshToken.mockResolvedValue({
      id: 1,
      refreshToken: 'different-token'
    });

    await expect(
      service.refreshToken('valid-token')
    ).rejects.toThrow();

  });

  // Test para verifiar se renueven el accessToken y el refreshToken:
  it('should return new tokens if refresh token is valid', async () => {

    jwt.verify.mockReturnValue({ sub: 1 });
    jwt.sign.mockReturnValue('new-token');

    const fakeUser = {
      id: 1,
      role: 'customer',
      refreshToken: 'valid-token',
      toJSON: () => ({ id: 1, role: 'customer' })
    };

    service.userService.findOneWithRefreshToken.mockResolvedValue(fakeUser);

    const result = await service.refreshToken('valid-token');

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(service.userService.update).toHaveBeenCalled();

  });

  // Test para caso feliz: email enviado:
  it('should send recovery email', async () => {

    const fakeUser = {
      id: 1,
      email: 'test@test.com'
    };

    service.userService.findByEmail.mockResolvedValue(fakeUser);

    jwt.sign.mockReturnValue('fake-token');

    const result = await service.sendRecovery('test@test.com');

    expect(service.userService.update).toHaveBeenCalledWith(1, {
      recoveryToken: 'fake-token'
    });

    expect(service.mailService.sendMail).toHaveBeenCalled();

    expect(result).toEqual({ message: 'Mail sent.' });
  });

  // Test para cambio de contraseñas (changePassword):

  //  1. ❌ Token inválido: jwt.verify lanza error

  it('should throw error if token is invalid', async () => {

    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await expect(
      service.changePassword('bad-token', '123456')
    ).rejects.toThrow();

  });

  //  2. ❌ Usuario no existe: findOneWithRecoveryToken → null

  it('should throw error if user not found', async () => {

    jwt.verify.mockReturnValue({ sub: 1 });

    service.userService.findOneWithRecoveryToken.mockResolvedValue(null);

    await expect(
      service.changePassword('valid-token', '123456')
    ).rejects.toThrow();

  });

  //  3. ❌ Token no coincide: user.recoveryToken !== token

  it('should throw error if token does not match', async () => {

    jwt.verify.mockReturnValue({ sub: 1 });

    service.userService.findOneWithRecoveryToken.mockResolvedValue({
      id: 1,
      recoveryToken: 'different-token'
    });

    await expect(
      service.changePassword('valid-token', '123456')
    ).rejects.toThrow();

  });

  //  4. ✅ Caso feliz: todo correcto

  it('should change password successfully', async () => {

    jwt.verify.mockReturnValue({ sub: 1 });

    const fakeUser = {
      id: 1,
      email: 'test@test.com',
      recoveryToken: 'valid-token'
    };

    service.userService.findOneWithRecoveryToken.mockResolvedValue(fakeUser);

    bcrypt.hash.mockResolvedValue('hashed-password');

    const result = await service.changePassword('valid-token', '123456');

    expect(service.userService.update).toHaveBeenCalledWith(1, {
      recoveryToken: null,
      password: 'hashed-password'
    });

    expect(service.mailService.sendMail).toHaveBeenCalled();

    expect(result).toEqual({
      message: 'Password changed successfully..!'
    });

  });


});
