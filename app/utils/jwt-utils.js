const jwt = require('jsonwebtoken')

exports.generateToken = (user, secretKey, tokenLife) => {
  return new Promise((resolve, reject) => {
    if (!secretKey) {
      return reject(new Error('No token provided as environment variable'))
    }
    jwt.sign(
      { data: { ...user } },
      secretKey,
      {
        algorithm: 'HS256',
        expiresIn: tokenLife
      },
      (err, token) => {
        if (err) {
          return reject(err)
        }
        resolve(token)
      }
    )
  })
}

exports.verifyToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      resolve(decoded)
    })
  })
}
