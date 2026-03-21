const boom = require('@hapi/boom');
const { config } = require('../config/config');

const UserService = require('./users.service');
const MailService = require('./mail.service');

const { hashData, compareData } = require('../utils/security/hash');
const { buildRecoveryEmail, buildPasswordChangedEmail } = require('../libs/mail.builder');
const { signToken, verifyToken } = require('../utils/security/token')

class AuthService {
  constructor(userService, mailService) {
    this.userService = userService || new UserService();
    this.mailService = mailService || new MailService();
  };

  async getUser( email, password ) {
    const user = await this.userService.findByEmailWithPassword(email);
    if ( !user ) {
        throw boom.unauthorized('Invalid credentials');
    };

    const isMatch = await compareData(password, user.password);
    if ( !isMatch ) {
        throw boom.unauthorized('Invalid credentials');
    };
    return user;
  };

  async signToken( user ) {
    const payload = {
      sub: user.id,
      role: user.role
    };

    const accessToken = signToken(payload, '15m');

    const refreshToken = signToken(payload, '7d');

    const hashedRefreshToken = await hashData(refreshToken);

    await this.userService.updateBySystem(user.id, {
      refreshToken: hashedRefreshToken
    });

    const userData = user.toJSON();
    delete userData.password;      // eliminar password antes de responder
    delete userData.recoveryToken;
    delete userData.refreshToken; // eliminar recoveryToken antes de responder

    return {
      user: userData,
      accessToken,
      refreshToken
    };
  };

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw boom.badRequest('Refresh token required');
    };

    try {
      const payload = verifyToken(refreshToken);

      const user = await this.userService.findOneWithRefreshToken(payload.sub);

      // 1. validar primero que el usuario y su refreshToken, existan en la BD:
      if (!user) {
        throw boom.unauthorized('Invalid credentials');
      }

      if (!user.refreshToken) {
        throw boom.unauthorized('Invalid credentials');
      }

      // 2. luego comparar
      const isMatch = await compareData(refreshToken, user.refreshToken);

      if (!isMatch) {
        // 🚨 posible refresh token robado
        await this.userService.updateBySystem(user.id, {
          refreshToken: null
        });

        throw boom.unauthorized('Refresh token reuse detected. Please login again.');
      };

      // 3. generar nuevos tokens
      const newAccessToken = signToken(
        { sub: user.id, role: user.role }, '15m'
      );

      const newRefreshToken = signToken(
        { sub: user.id, role: user.role }, '7d'
      );

      const hashedRefreshToken = await hashData(newRefreshToken);

      await this.userService.updateBySystem(user.id, {
        refreshToken: hashedRefreshToken
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };

    } catch (error) {
      if (error.isBoom) {
        throw error;
      };
      if (error.name === 'TokenExpiredError') {
        throw boom.unauthorized('Refresh token expired');
      };
      throw boom.unauthorized('Invalid refresh token');
    };
  };

  async sendRecovery( email ) {
    const user = await this.userService.findByEmail(email);
    if ( !user ) {
      throw boom.unauthorized('Invalid credentials');
    };

    const payload = { sub: user.id };
    const token = signToken(payload, '15m', config.jwtRecoverySecret);
    const hashedToken = await hashData(token);

    await this.userService.updateBySystem(user.id, {
      recoveryToken: hashedToken
    });

    const mailRecovery = buildRecoveryEmail(user.email, token);

    await this.mailService.sendMail(mailRecovery);
    return { message: 'Mail sent.' };
  };

  async changePassword(token, newPassword) {
    try {
      const payload = verifyToken(token, config.jwtRecoverySecret);
      const user = await this.userService.findOneWithRecoveryToken(payload.sub);

      if (!user || !user.recoveryToken) {
        throw boom.unauthorized('Invalid credentials');
      };

      const isMatch = await compareData(token, user.recoveryToken);

      if (!isMatch) {
        throw boom.unauthorized('Invalid credentials');
      };

      const hash = await hashData(newPassword);
      await this.userService.updateBySystem(user.id, {
        recoveryToken: null,
        refreshToken: null,
        password: hash
      });

      const mailConfirmation = buildPasswordChangedEmail(user.email);

      await this.mailService.sendMail(mailConfirmation)
      return { message: 'Password changed successfully..!' };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw boom.unauthorized('Token expired');
      };
      throw boom.unauthorized('Invalid token');
    };
  };

  async logout(userId) {
    await this.userService.updateBySystem(userId, {
      refreshToken: null
    });

    return { message: 'Logged out successfully' };
  };

};

module.exports = AuthService;
