const { config } = require('../config/config');

const buildRecoveryEmail = (to, token) => {
  const link = `https://myfrontend.com/recovery?token=${token}`;

  return {
    from: `LanTech ${config.smtpUser}`,
    to,
    subject: 'Recuperación de contraseña...',
    html: `
      Si has solicitado cambiar la contraseña de tu cuenta, por favor, ingresa al siguiente enlace:
      <br><br>
      <strong>${link}</strong>
      <br><br>
      <i>De lo contrario, comunícate inmediatamente a Soporte Técnico.</i>
      <br><br><br>
      Atentamente,<br>
      <b>LanTech</b>
    `
  };
};

const buildPasswordChangedEmail = (to) => {
  return {
    from: `LanTech ${config.smtpUser}`,
    to,
    subject: 'Contraseña actualizada exitosamente..!',
    html: `
      <strong>Hola</strong>
      <br><br>
      La contraseña de la cuenta se ha restablecido recientemente.
      Si lo ha hecho, este mensaje es solo para su información.
      <br><br>
      <i>Si no está seguro de si <b>usted</b> o su <b>administrador</b> ha realizado este restablecimiento de
      contraseña, debe ponerse en contacto con Soporte Técnico inmediatamente.</i>
      <br><br>
      Atentamente,
      <br>
      <b>LanTech</b>
    `
  };
};

module.exports = { buildRecoveryEmail, buildPasswordChangedEmail };
