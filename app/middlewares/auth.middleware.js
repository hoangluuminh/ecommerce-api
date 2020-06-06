const _ = require("lodash");

const jwtUtils = require("../utils/jwt.utils");
const HttpError = require("../models/classes/http-error");
const authConfig = require("../configs/auth.config");
const { getAuthMsg } = require("../utils/logging.utils");
const { cookieNames } = require("../utils/cookie.utils");
const { ERRORS } = require("../utils/const.utils");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const middlewareName = "isAuth";

exports.authSetup = (req, res, next) => {
  // Setup req.authFor
  const checkEndpoint = req.originalUrl;
  if (_.filter(authConfig.endpoints.STAFF, o => checkEndpoint.indexOf(o) === 0).length >= 1) {
    req.authFor = authConfig.identifier.STAFF;
  } else {
    req.authFor = authConfig.identifier.USER;
  }
  return next();
};

// Required authSetup to run prior
exports.isAuth = async (req, res, next) => {
  const actionName = "isAuth";
  const accessTokenFromClient = req.cookies[cookieNames(req).accessToken];
  const refreshTokenFromClient = req.cookies[cookieNames(req).refreshToken];
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
    // SHOP
    if (roles.includes("user")) {
      if (req.jwtDecoded.data.role && roles.length === 1) {
        // user should not have data.role; only end check if "roles" only has "user"
        return next(new HttpError(...ERRORS.AUTH.UNAUTHORIZED));
        // eslint-disable-next-line
      } else {
        return next();
      }
    }
    // MANAGE
    if (!req.jwtDecoded.data.role || roles.indexOf(req.jwtDecoded.data.role) < 0) {
      return next(new HttpError(...ERRORS.AUTH.UNAUTHORIZED));
    }
    return next();
  };
}
exports.hasRole = hasRole;
