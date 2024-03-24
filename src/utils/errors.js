class ServerError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.status = statusCode;
  }
}

module.exports = ServerError;
