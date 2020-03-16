const jwtUtils = require('../utils/jwt-utils')
const HttpError = require('../models/http-error')
const { getAuthMsg } = require('../utils/logging-utils')
const { cookieNames } = require('../utils/cookie-utils')

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const middlewareName = 'isAuth'

exports.isAuth = async (req, res, next) => {
  const actionName = 'isAuth'
  const accessTokenFromClient = req.cookies[cookieNames.accessToken]
  const refreshTokenFromClient = req.cookies[cookieNames.refreshToken]
  if (!accessTokenFromClient || !refreshTokenFromClient) {
    return next(new HttpError('Unauthenticated', 401))
  }
  try {
    const decoded = await jwtUtils.verifyToken(accessTokenFromClient, accessTokenSecret)
    req.jwtDecoded = decoded
    next()
  } catch (error) {
    getAuthMsg(`${middlewareName}.${actionName}`, error)
    if (error.name === 'TokenExpiredError') {
      return next(new HttpError('Unauthenticated', 403)) // IMPORTANT: If client receives 403, client should call refresh-token
    }
    // Invalid token
    return next(new HttpError('Unauthenticated', 401))
  }
}

function hasRole (roles) {
  return (req, res, next) => {
    if (roles.indexOf(req.jwtDecoded.data.role) < 0) {
      return next(new HttpError('Unauthorized', 401))
    }
    next()
  }
}
exports.hasRole = hasRole
