const user = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const URLErr = new Error('Неправильный формат ссылки');
URLErr.statusCode = 400;

const {
  findCurrentUser,
  patchUser,
} = require('../controllers/users');

user.get('/users/me', findCurrentUser);

user.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
  }),
}), patchUser);

module.exports = user;