'use strict';

const { Sequelize } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */

const { USER_TABLE } = require('../models/user.model');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(USER_TABLE, 'refresh_token', {
      field: 'refresh_token',
      allowNull: true,
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn(USER_TABLE, 'refresh_token');
  }
};
