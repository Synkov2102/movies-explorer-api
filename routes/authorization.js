const authorization = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  login,
  createUser,
} = require('../controllers/users');

authorization.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

authorization.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

module.exports = authorization;
