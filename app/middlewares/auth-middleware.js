const jwtUtils = require("../utils/jwt-utils");
const HttpError = require("../models/classes/http-error");
const { getAuthMsg } = require("../utils/logging-utils");
const { cookieNames } = require("../utils/cookie-utils");
const { ERRORS } = require("../utils/const-utils");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const middlewareName = "isAuth";

exports.isAuth = async (req, res, next) => {
  const actionName = "isAuth";
  const accessTokenFromClient = req.cookies[cookieNames.accessToken];
  const refreshTokenFromClient = req.cookies[cookieNames.refreshToken];
  if (!accessTokenFromClient || !refreshTokenFromClient) {
    return next(new HttpError(...ERRORS.AUTH.UNAUTHENTICATED));
  }
  try {
    const decoded = await jwtUtils.verifyToken(accessTokenFromClient, accessTokenSecret);
    req.jwtDecoded = decoded;
    return next();
  } catch (error) {
    getAuthMsg(`${middlewareName}.${actionName}`, error);
    if (error.name === "TokenExpiredError") {
      return next(new HttpError(...ERRORS.AUTH.SESSIONEXPIRED)); // IMPORTANT: If client receives this error, client should call refresh-token
    }
    // Invalid token
    return next(new HttpError(...ERRORS.AUTH.UNAUTHENTICATED));
  }
};

function hasRole(roles) {
  return (req, res, next) => {
    if (roles.indexOf(req.jwtDecoded.data.role) < 0) {
      return next(new HttpError(...ERRORS.AUTH.UNAUTHORIZED));
    }
    return next();
  };
}
exports.hasRole = hasRole;
