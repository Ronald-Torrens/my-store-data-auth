const express = require('express');
const router = express.Router();

const UsersService = require('../services/users.service');
const service = new UsersService();

const validatorHandler = require('../middleware/validator.handler');
const { createUserSchema, getUserSchema, updateUserSchema } = require('../schemas/users.schemas');

const passport = require('passport');
const { checkRoles, checkOwnershipOrAdmin } = require('../middleware/auth.handler');

router.get('/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin'),
  async (req, res, next) => {
    try {
      const users = await service.find();
      res.status(200).json(users);
    } catch (error) {
      next(error)
    };
  }
);

router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  checkOwnershipOrAdmin('id'),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await service.findOne(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  validatorHandler(createUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newUser = await service.create(body);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    };
  }
);

router.patch('/:id',
  passport.authenticate('jwt', { session: false }),
  checkOwnershipOrAdmin('id'),
  validatorHandler(getUserSchema, 'params'),
  validatorHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const { id } = req.params;
      const currentUser = req.user;
      const updateUser = await service.update(id, body, currentUser);
      res.status(201).json(updateUser);
    } catch (error) {
      next(error);
    };
  }
);

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin'),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      const deleteUser = await service.delete(id, currentUser);
      res.status(200).json(deleteUser);
    } catch (error) {
      next(error);
    };
  }
);

module.exports = router;
