const express = require('express');
const router = express.Router();

const OrdersService = require('../services/orders.service');
const service = new OrdersService();

const passport = require('passport');

router.get('/my-orders',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const orders = await service.findByUser(user.sub);
      res.status(200).json(orders)
    } catch (error) {
      next(error)
    }
});

module.exports = router;
