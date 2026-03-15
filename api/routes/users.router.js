const express = require('express');
const router = express.Router();

const UsersService = require('../services/users.service');
const service = new UsersService();

const validatorHandler = require('../middleware/validator.handler');
const { createUserSchema, getUserSchema, updateUserSchema } = require('../schemas/users.schemas');

router.get('/', async (req, res, next) => {
  try {
    const users = await service.find();
    res.status(200).json(users);
  } catch (error) {
    next(error)
  };
});

router.get('/:id',
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
  validatorHandler(getUserSchema, 'params'),
  validatorHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const { id } = req.params;
      const updateUser = await service.update(id, body);
      res.status(201).json(updateUser);
    } catch (error) {
      next(error);
    };
  }
);

router.delete('/:id',
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleteUser = await service.delete(id);
      res.status(200).json(deleteUser);
    } catch (error) {
      next(error);
    };
  }
);

module.exports = router;
