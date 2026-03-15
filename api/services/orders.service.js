const boom = require('@hapi/boom');

const { models } = require('../libs/sequelize');

class OrdersService {
  constructor() {};

  async create(data) {
    const newOrder = await models.Order.create(data);
    return newOrder;
  };

  async addItem(data) {
    const newItem = await models.OrderProduct.create(data);
    return newItem;
  };

  async findByUser(userId) {
    const orders = await models.Order.findAll({
      where: {
        '$customer.user.id$': userId
      },
      include: [
        {
          association: 'customer',
          include: ['user']
        }
      ]
    });
    return orders;
  };

  async find() {
    const orders = await models.Order.findAll();
    return orders;
  };

  async findOne(id) {
    const order = await models.Order.findByPk(id, {
      include: [
        {
          association: 'customer',
          include: ['user']
        },
        'items'
      ]
    });
    if(!order) {
      throw boom.notFound('Order not found.');
    }
    return order;
  };

  async update(id, changes) {
    const order = await this.findOne(id);
    const orderUpdate = await order.update(changes);
    return orderUpdate;
  };

  async delete(id) {
    const order = await this.findOne(id);
    await order.destroy();
    return {
      message: 'Deleted successfully.',
      id
    };
  };
};

module.exports = OrdersService;
