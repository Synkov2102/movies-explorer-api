const Movie = require('../models/movies');

const ErrorValidation = require('../errors/ErrorValidation');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorForbidden = require('../errors/ErrorForbidden');

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => res.send({ movie }))
    .catch((err) => {
      if ((err.name === 'CastError') || (err.name === 'ValidationError')) {
        throw new ErrorValidation('Переданы некорректные данные');
      }
      next(err);
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) { throw new ErrorNotFound('Фильм не найден'); }
      if (String(movie.owner._id) !== req.user._id) {
        throw new ErrorForbidden('Фильм принадлежит другому пользователю');
      }
      return movie.remove();
    })
    .then((deleted) => res.send({ deleted }))
    .catch((err) => {
      if ((err.name === 'CastError') || (err.name === 'ValidationError')) {
        throw new ErrorValidation('Переданы некорректные данные');
      }
      next(err);
    });
};

module.exports.findMovies = (req, res, next) => {
  Movie.find({ owner: req.user })
    .then((movie) => res.send({ movie }))
    .catch(next);
};
