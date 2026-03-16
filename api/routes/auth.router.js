const express = require('express');
const passport = require('passport');

const router = express.Router();

const { loginLimiter, recoveryLimiter, changePasswordLimiter } = require('../middleware/rateLimiter.handler');
const validatorHandler = require('../middleware/validator.handler');
const { loginAuthSchema, recoveryAuthSchema, changePasswordAuthSchema } = require('../schemas/auth.schemas');

const AuthService = require('../services/auth.service');
const service = new AuthService();


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@mail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 */

router.post('/login',
  loginLimiter,
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
  recoveryLimiter,
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
  changePasswordLimiter,
  validatorHandler(changePasswordAuthSchema, 'body'),
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
