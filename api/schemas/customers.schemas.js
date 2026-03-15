const Joi = require('joi');
const { createUserSchema, updateUserSchema } = require('./users.schemas');

const id = Joi.number().integer();
const name = Joi.string().min(3).max(50);
const lastName = Joi.string().min(3).max(50);
const phone = Joi.string().min(5);

const createCustomerSchema = Joi.object({
  name: name.required(),
  lastName: lastName.required(),
  phone: phone.required(),
  user: createUserSchema
});

const updateCustomerSchema = Joi.object({
  name: name,
  lastName: lastName,
  phone: phone,
  user: updateUserSchema
});

const getCustomerSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCustomerSchema, updateCustomerSchema, getCustomerSchema };
