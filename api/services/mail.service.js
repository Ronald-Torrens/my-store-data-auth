const { config } = require('../config/config');
const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      }
    });
  }

  async sendMail(infoMail) {
    return await this.transporter.sendMail(infoMail);
  }
}

module.exports = MailService;
