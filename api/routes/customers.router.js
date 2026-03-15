const express = require('express');
const router = express.Router();

const CustomersService = require('../services/customers.service');
const service = new CustomersService();

const passport = require('passport');

const validatorHandler = require('../middleware/validator.handler');
const { createCustomerSchema, updateCustomerSchema, getCustomerSchema } = require('../schemas/customers.schemas');

router.get('/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const customers = await service.find();
      res.status(200).json(customers);
    } catch (error) {
      next(error)
    };
  }
);

router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getCustomerSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const customers = await service.findOne(id);
      res.status(200).json(customers);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(createCustomerSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCustomer = await service.create(body);
      res.status(201).json(newCustomer);
    } catch (error) {
      next(error);
    };
  }
);

router.patch('/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getCustomerSchema, 'params'),
  validatorHandler(updateCustomerSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const { id } = req.params;
      const updateCustomer = await service.update(id, body);
      res.status(201).json(updateCustomer);
    } catch (error) {
      next(error);
    };
  }
);

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getCustomerSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleteCustomer = await service.delete(id);
      res.status(200).json(deleteCustomer);
    } catch (error) {
      next(error);
    };
  }
);

module.exports = router;
