const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //! ------------------------------> Handling MONGODB ID ERRORS /castErrors --------->

  if (err.name === "CastError") {
    const message = `Resource not found! Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //!handling duplicate key error collection in mongoose

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }
  //! Handling duplicate json web token

  if (err.name === "JsonWebTokenError") {
    const message = `JSON web token is invalid ! please try again`;
    err = new ErrorHandler(message, 400);
  }
  // Jwt EXPIRE ERROR
  if (err.name === "TokenExpiredError") {
    const message = `JSON web token is expired ! please try again`;
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({ success: false, message: err.message });
};
