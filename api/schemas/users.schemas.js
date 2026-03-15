const Joi = require('joi');

const id = Joi.number().integer();
const email = Joi.string().min(3).max(50);
const password = Joi.string().min(8);
const role = Joi.string().min(5);

const createUserSchema = Joi.object({
  email: email.required(),
  password: password.required(),
  role: role
});

const updateUserSchema = Joi.object({
  email: email,
  password: password,
  role: role
});

const getUserSchema = Joi.object({
  id: id.required(),
});

module.exports = { createUserSchema, updateUserSchema, getUserSchema };
