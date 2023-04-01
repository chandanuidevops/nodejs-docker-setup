const express = require('express');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const cloudinaryRouter = require('./routes/cloudinaryRoutes');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'DELETE, POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  return next();
});

app.use(cors());
// app.use(
//   cors({
//     origin: ['http://localhost:3001'],
//     methods: ['DELETE, POST, GET, OPTIONS'],
//     headers: ['Content-Type, X-Requested-With'],
//   })
// );

//GLOBAL middleware
//serving static files
app.use(express.static(`${__dirname}/public`));
//security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'unpkg.com', 'http://localhost:3001/'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      // fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
    },
  })
);
if (process.env.NODE_ENV == 'production') {
  app.use(morgan('dev'));
}
app.use(compression());
//limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP',
});

app.use('/api', limiter);
app.use(cookieParser());
//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//data sanitization against noSql query injection
app.use(mongoSanitize());
//data sanitization against XSS
app.use(xss());
//prevent query parameter
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'average',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  next();
});

//ROUTES

app.use('/', viewRouter);
app.use('/api/v1/cloudinary', cloudinaryRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Cann't found ${req.originalUrl} on this server`)
  // err.status='fail'
  // err.statusCode=404
  next(new AppError(`Cann't found ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
