const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const ErrorUnauthorized = require('../errors/ErrorUnauthorized');
const ErrorValidation = require('../errors/ErrorValidation');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorConflict = require('../errors/ErrorConflict');

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then(() => res.send({
      data: {
        name, email,
      },
    }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ErrorConflict('Пользователь c такой почтой уже зарегистрирован'));
      } else {
        next(err);
      }
    });
};

module.exports.findCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) { throw new ErrorNotFound('Пользователь не найден'); }
      return res.send({ user });
    })
    .catch(next);
};

module.exports.patchUser = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) { throw new ErrorNotFound('Пользователь не найден'); }
      return res.send({ user });
    })
    .catch((err) => {
      if ((err.name === 'CastError') || (err.name === 'ValidationError')) {
        throw new ErrorValidation('Переданы некорректные данные');
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let token = '';
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new ErrorUnauthorized('Неправильная почта или пароль');
      }
      token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        // хеши не совпали — отклоняем промис
        throw new ErrorUnauthorized('Неправильная почта или пароль');
      }

      // аутентификация успешна
      return res
        .status(200)
        .send({ token });
    })
    .catch((err) => {
      if ((err.name === 'CastError') || (err.name === 'ValidationError')) {
        throw new ErrorValidation('Переданы некорректные данные');
      }
      next(err);
    });
};
