class LogError extends Error {
  constructor (message, name) {
    super(message)
    this.name = name
  }
}

module.exports = LogError
