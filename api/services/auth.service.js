const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('../config/config');
const nodemailer = require("nodemailer");

const UserService = require('./users.service');
const service = new UserService();

class AuthService {
  constructor() {
    this.transporter = nodemailer.createTransport({ // sugerencia de ChatGPT
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      }
    });
    // helper interno para construir mails
    this.mailHelper = (to, subject, htmlBody) => {
      return {
        from: `LanTech ${config.smtpUser}`,
        to,
        subject,
        html: htmlBody
      };
    };
  };

  async getUser( email, password ) {
    const user = await service.findByEmailWithPassword(email);
    if ( !user ) {
        throw boom.unauthorized();
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if ( !isMatch ) {
        throw boom.unauthorized();
    };
    return user;
  };

  async signToken( user ) {
    const jwtConfig = {
      expiresIn: '7d'
    };
    const payload = {
      sub: user.id,
      role: user.role
    };
    const token = jwt.sign(payload, config.jwtSecret, jwtConfig);

    const userData = user.toJSON();
    delete userData.password;      // eliminar password antes de responder
    delete userData.recoveryToken; // eliminar recoveryToken antes de responder

    return {
      user: userData,
      token
    };
  };

  async sendRecovery( email ) {
    const user = await service.findByEmail(email);
    if ( !user ) {
      throw boom.unauthorized();
    };

    const payload = { sub: user.id };
    const token = jwt.sign(payload, config.jwtSecret, {expiresIn: '15min'});
    const link = `https://myfrontend.com/recovery?token=${token}`;
    await service.update(user.id, { recoveryToken: token })

    const mailRecovery = this.mailHelper(
      user.email,
      "Recuperación de contraseña...",
      `
      <b>Si desea cambiar la contraseña de su cuenta, por favor, ingrese al siguiente link:</b>
      <br>
      ${link}
      `
    );

    await this.sendMail(mailRecovery);
    return { message: 'Mail sent.' };
  }

  async sendMail(infoMail) {
    try {
      const info = await this.transporter.sendMail(infoMail);
      console.log('Mail enviado:', info);

    } catch (err) {
      console.error('Error enviando mail:', err);
      throw err;
    };
  };

  async changePassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await service.findOneWithRecoveryToken(payload.sub);

      if ( user.recoveryToken !== token ) {
        throw boom.unauthorized();
      };

      const hash = await bcrypt.hash(newPassword, 10);
      await service.update(user.id, {
        recoveryToken: null,
        password: hash
      });

      const mailConfirmation = this.mailHelper(
        user.email,
        "Recuperación de contraseña exitosa.",
        `
        <strong>Hola</strong>
        <br><br>
        Tu contraseña ha sido cambiada correctamente.
        <br><br>
        <i>Si no realizaste este cambio, por favor, contacta inmediatamente al Soporte Técnico.</i>
        <br><br>
        Saludos,
        <br>
        <b>LanTech</b>
        `
      );

      await this.sendMail(mailConfirmation)
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
