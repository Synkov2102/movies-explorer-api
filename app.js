const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

const ErrorNotFound = require('./errors/ErrorNotFound');

const { PORT = 3000, NODE_ENV, DB_URL } = process.env;

const user = require('./routes/users');
const movie = require('./routes/movies');
const authorization = require('./routes/authorization');
const auth = require('./middlewares/auth');

// подключаемся к серверу mongo
mongoose.connect(NODE_ENV === 'production' ? DB_URL : 'mongodb://127.0.0.1:27017/moviedb');

// Массив доменов, с которых разрешены кросс-доменные запросы
const allowedCors = [
  'https://praktikum.tk',
  'http://praktikum.tk',
  'http://localhost:3000',
  'http://synkov.students.nomoredomains.sbs',
  'https://synkov.students.nomoredomains.sbs',
];

// подключаем мидлвары, роуты и всё остальное...
app.use(express.json());
app.use(requestLogger);
app.use((req, res, next) => {
  const { origin } = req.headers; // Сохраняем источник запроса в переменную origin
  // проверяем, что источник запроса есть среди разрешённых
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  const { method } = req; // Сохраняем тип запроса (HTTP-метод) в соответствующую переменную

  // Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
  // eslint-disable-next-line no-sequences
  const requestHeaders = req.headers['access-control-request-headers'];

  // Если это предварительный запрос, добавляем нужные заголовки
  if (method === 'OPTIONS') {
    if (allowedCors.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    // разрешаем кросс-доменные запросы любых типов (по умолчанию)
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    // разрешаем кросс-доменные запросы с этими заголовками
    res.header('Access-Control-Allow-Headers', requestHeaders);
    // завершаем обработку запроса и возвращаем результат клиенту
    return res.end();
  }
  return next();
});

app.use('/', authorization);
app.use(auth);
app.use('/', user);
app.use('/', movie);
app.use('/', (req, res, next) => {
  next(() => { throw new ErrorNotFound('Страница не найдена'); });
});
app.use(errorLogger);
app.use(errors());
app.use((err, req, res, next) => {
  next();
  const { statusCode = 500, message } = err;
  return res
    .status(statusCode)
    .send({
      message,
    });
});

app.listen(PORT);
