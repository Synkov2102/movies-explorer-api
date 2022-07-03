const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');

const ErrorValidation = require('../errors/ErrorValidation');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ErrorValidation('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    throw new ErrorValidation('Необходима авторизация');
  }
  req.user = payload;
  return next();
};
