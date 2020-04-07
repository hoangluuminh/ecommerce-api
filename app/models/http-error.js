class HttpError extends Error {
  constructor(name, message, httpStatusCode) {
    super(message); // Add a "message" prop
    this.name = name; // Add a "name" prop
    this.code = httpStatusCode; // Add a "code" prop
  }
}

module.exports = HttpError;
