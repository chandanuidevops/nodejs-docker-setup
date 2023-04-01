const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;

  return new AppError(message, err.statusCode);
};
const handleDuplicateFieldDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value : ${value}`
  return new AppError(message,400)
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const message = `Invalid input field data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = err=>{
  return new AppError('Invalid token. Please login again',401)
}
const handleTokenExpiredError=err=>{
  return new AppError('Your token has expired. Please login again',401)
}

const sendErrorDev = (err,req, res) => {
  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      staus: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }else{
    res.status(err.statusCode).render('error',{
      title:'Sonething went wrong',
      msg:err.message
    })
  }

};

const sendErrorProd = (err,req, res) => {
  //operational error or other error , don't leak
  if(req.originalUrl.startsWith('/api')){
    if (err.isOperational) {
      res.status(err.statusCode).json({
        staus: err.status,
        message: err.message,
      });
    } else {
      res.status(err.statusCode).json({
        staus: 'error',
        message: 'something wen very wrong!',
      });
    }
  }else{
    res.status(err.statusCode).render('error',{
      title:'Sonething went wrong',
      msg:err.message
    })
  }

};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err,req, res);
  } else {
    let error = Object.assign(err);
    error.statusCode = err.statusCode;

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.name === 'MongoError') {
      error = handleDuplicateFieldDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if(error.name==='JsonWebTokenError'){
      error = handleJsonWebTokenError(error)
    }
    if(error.name==='TokenExpiredError'){
      error = handleTokenExpiredError(error)
    }
    console.log(error.name)

    sendErrorProd(error,req, res);
  }
};
