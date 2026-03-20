const express = require('express');
const router = express.Router();

const passport = require('passport');

const CategoriesService = require('../services/categories.service');
const service = new CategoriesService();

const validatorHandler = require('../middleware/validator.handler');
const { createCategorySchema, getCategorySchema, updateCategorySchema } = require('../schemas/categories.schemas');

const { checkOwnershipOrAdmin, checkRoles } = require('../middleware/auth.handler');

router.get('/',
  //passport.authenticate('jwt', { session: false }),
  //checkRoles('admin', 'seller', 'customer'),
  async (req, res) => {
    const categories = await service.find();
    res.status(200).json(categories)
});

router.get('/:id',
  //passport.authenticate('jwt', { session: false }),
  //checkRoles('admin', 'seller', 'customer'),
  validatorHandler(getCategorySchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await service.findOne(id);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    };
  }
);

router.post('/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'seller'),
  validatorHandler(createCategorySchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCategory = await service.create(body);
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    };
  }
);

router.patch('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'seller'),
  validatorHandler(getCategorySchema, 'params'),
  validatorHandler(updateCategorySchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updateCategory = await service.update(id, body);
      res.status(201).json(updateCategory);
    } catch (error) {
      next(error);
    };
  }
);

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  checkOwnershipOrAdmin,
  validatorHandler(getCategorySchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleteCategory = await service.delete(id);
      res.status(200).json(deleteCategory);
    } catch (error) {
      next(error);
    };
  }
);

module.exports = router;
