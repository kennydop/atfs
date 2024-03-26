function errorHandler(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).send({
    // if error is a string, message will be the error. Otherwise, message will be the error message
    message: typeof err === "string" ? err : err.message,
    error: err,
  });
}

module.exports = errorHandler;
