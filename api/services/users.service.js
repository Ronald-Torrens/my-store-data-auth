const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const { models } = require('../libs/sequelize');

class UsersService {
  constructor() {}

  async create(data) {
    const hash = await bcrypt.hash(data.password, 10);
    const newUser = await models.User.create({
      ...data,
      password: hash
    });
    return newUser;
  };

  async find() {
    const users = await models.User.findAll({
      include: ['customer']
    });
    return users;
  };

  async findByEmail(email) {
    const username = await models.User.findOne({
      where: { email }
    });
    return username;
  };

  async findByEmailWithPassword(email) {
    const username = await models.User.scope('withPassword').findOne({
      where: { email }
    });
    return username;
  };

  async findOne(id) {
    const user = await models.User.findByPk(id);
    if(!user) {
      throw boom.notFound('User not found.');
    };
    return user;
  };

  async findOneWithRecoveryToken(id) {
    const user = await models.User.scope('withRecoveryToken').findByPk(id);
    if(!user) {
      throw boom.notFound('User not found.');
    };
    return user;
  };

  async update(id, changes) {
    const user = await this.findOne(id);
    const userUpdate = await user.update(changes);
    return userUpdate;
  };

  async delete(id) {
    const user = await this.findOne(id);
    await user.destroy();
    return {
      message: 'Deleted successfully.',
      id
    }
  };
};

module.exports = UsersService;
