const Movie = require('../models/movies');

const movieErr = new Error('Фильм принадлежит другому пользователю');
movieErr.statusCode = 403;

const incorrectDataErr = new Error('Переданы некорректные данные');
incorrectDataErr.statusCode = 400;

const notFoundErr = new Error('Фильм не найден');
notFoundErr.statusCode = 404;

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
        next(incorrectDataErr);
      }
      next(err);
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) { throw notFoundErr; }
      if (String(movie.owner._id) !== req.user._id) {
        return Promise.reject(movieErr);
      }
      return movie.remove();
    })
    .then((deleted) => res.send({ deleted }))
    .catch((err) => {
      if ((err.name === 'CastError') || (err.name === 'ValidationError')) {
        next(incorrectDataErr);
      }
      next(err);
    });
};

module.exports.findMovies = (req, res, next) => {
  Movie.find({})
    .then((movie) => res.send({ movie }))
    .catch((err) => next(err));
};
