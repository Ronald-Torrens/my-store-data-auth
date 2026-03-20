const express = require('express');
const router = express.Router();

const ProductsService = require('../services/product.service');
const service = new ProductsService();

const validatorHandler = require('../middleware/validator.handler');
const { createProductSchema, updateProductSchema, getProductSchema, queryProductSchema } = require('../schemas/products.schemas');

const passport = require('passport');
const { checkRoles, checkOwnershipOrAdmin } = require('../middleware/auth.handler');


router.get('/',
  validatorHandler(queryProductSchema, 'query'),
  async (req, res, next) => {
    try {
      const products = await service.find(req.query);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    };
  }
);

// Generando consulta específica por id:

router.get('/:id',
  validatorHandler(getProductSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await service.findOne(id);
      res.status(200).json(product);
    } catch (error) {
      next (error);
    }
  }
);

// Generando el método POST:

router.post('/',
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin', 'seller'),
    validatorHandler(createProductSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newProduct = await service.create(body);
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    };
  }
);

// Generando el método PATCH:

router.patch('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'seller'),
  validatorHandler(getProductSchema, 'params'),
  validatorHandler(updateProductSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updateProduct = await service.update(id, body);
      res.status(201).json(updateProduct);

    } catch (error) {
      next(error);
    };
  }
);

// Generando el método DELETE:

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  checkOwnershipOrAdmin,
  validatorHandler(getProductSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleteProduct = await service.delete(id);
      res.status(200).json(deleteProduct);
    } catch (error) {
      next(error);
    };
  }
);

module.exports = router;
