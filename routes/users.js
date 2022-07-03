const user = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  findCurrentUser,
  patchUser,
} = require('../controllers/users');

user.get('/users/me', findCurrentUser);

user.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email({ tlds: { allow: false } }),
  }),
}), patchUser);

module.exports = user;
