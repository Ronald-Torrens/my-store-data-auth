const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('../config/config');

const UserService = require('./users.service');
const MailService = require('./mail.service');

const { buildRecoveryEmail, buildPasswordChangedEmail } = require('../libs/mail.builder');

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

    const isMatch = await bcrypt.compare(password, user.password);
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

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '7d'
    });

    await this.userService.update(user.id, { refreshToken });

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
  try {
    const payload = jwt.verify(refreshToken, config.jwtSecret);

    const user = await this.userService.findOneWithRefreshToken(payload.sub);

    if (!user || user.refreshToken !== refreshToken) {
      throw boom.unauthorized('Invalid credentials');
    };

    const newAccessToken = jwt.sign(
      { sub: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    // 🔥 NUEVO refresh token
    const newRefreshToken = jwt.sign(
      { sub: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // 🔥 guardar el nuevo (mata el anterior)
    await this.userService.update(user.id, {
      refreshToken: newRefreshToken
    });

    const userData = user.toJSON();
    delete userData.refreshToken;

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw boom.unauthorized('Refresh token expired');
    }
    throw boom.unauthorized('Invalid refresh token');
  };
};

  async sendRecovery( email ) {
    const user = await this.userService.findByEmail(email);
    if ( !user ) {
      throw boom.unauthorized('Invalid credentials');
    };

    const payload = { sub: user.id };
    const token = jwt.sign(payload, config.jwtRecoverySecret, {expiresIn: '15min'});
    await this.userService.update(user.id, { recoveryToken: token })

    const mailRecovery = buildRecoveryEmail(user.email, token)

    await this.mailService.sendMail(mailRecovery);
    return { message: 'Mail sent.' };
  }

  async changePassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, config.jwtRecoverySecret);
      const user = await this.userService.findOneWithRecoveryToken(payload.sub);

      if ( !user || user.recoveryToken !== token ) {
        throw boom.unauthorized('Invalid credentials');
      };

      const hash = await bcrypt.hash(newPassword, 10);
      await this.userService.update(user.id, {
        recoveryToken: null,
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
};

module.exports = AuthService;
