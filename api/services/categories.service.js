const { faker } = require('@faker-js/faker');
const boom = require('@hapi/boom');

const { models } = require('../libs/sequelize');

class CategoriesService {
  constructor() {};

  async create(data) {
    const newCategory = await models.Category.create(data);
    return newCategory;
  };

  async find() {
    const category = await models.Category.findAll();
    return category;
  };

  async findOne(id) {
    const category = await models.Category.findByPk(id, {
      include: ['products']
    });
    if(!category) {
      throw boom.notFound('Category not found.');
    }
    return category;
  };

  async update(id, changes) {
    const category = await this.findOne(id);
    const categoryUpdate = category.update(changes);
    return categoryUpdate;
  };

  async delete(id) {
    const category = await this.findOne(id);
    await category.destroy();
    return {
      message: 'Deleted successfully.',
      id
    };
  };

};

module.exports = CategoriesService;
