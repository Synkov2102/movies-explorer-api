const movies = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const ErrorValidation = require('../errors/ErrorValidation');

const validateURL = (value) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    throw new ErrorValidation('Неправильный формат ссылки');
  }
  return value;
};

const {
  createMovie,
  findMovies,
  deleteMovieById,
} = require('../controllers/movies');

movies.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.custom(validateURL).required(),
    trailerLink: Joi.custom(validateURL).required(),
    thumbnail: Joi.custom(validateURL).required(),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

movies.get('/movies', findMovies);

movies.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex().required(),
  }),
}), deleteMovieById);

module.exports = movies;
