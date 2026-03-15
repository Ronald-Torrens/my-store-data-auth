const express = require('express');
const passport = require('passport');

const router = express.Router();

const validatorHandler = require('../middleware/validator.handler');
const { loginAuthSchema, recoveryAuthSchema, changePasswordAuthSchema } = require('../schemas/auth.schemas');

const AuthService = require('../services/auth.service');
const service = new AuthService();

router.post('/login',
  validatorHandler(loginAuthSchema, 'body'),
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const response = await service.signToken(user)
      res.status(200).json(response);
    } catch (error) {
      next(error);
    };
  }
);

router.post('/recovery',
  validatorHandler(recoveryAuthSchema, 'body'),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const response = await service.sendRecovery(email);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    };
  }
);

router.post('/change-password',
  validatorHandler(changePasswordAuthSchema, 'body'),
  //passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      const response = await service.changePassword(token, newPassword);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    };
  }
);

module.exports = router;
