const bcrypt = require("bcrypt");
const db = require("../models");
const { Op } = db.Sequelize;

const authConfig = require("../configs/auth.config");
const jwtUtils = require("../utils/jwt.utils");
const { TOKENLIFE: tokenLife, SECRETKEY: secretKey, ERRORS } = require("../utils/const.utils");
const redisService = require("./redis.service");
const HttpError = require("../models/classes/http-error");
const LogError = require("../models/classes/log-error");
// const { fn, col } = db.Sequelize
const { account: Account, accountStaff: AccountStaff, accountUser: AccountUser } = db;
// const UserRole = db.userRole

exports.performLogin = async (req, username, password, remember) => {
  // Get account
  const checkInWhere =
    req.authFor === authConfig.identifier.STAFF
      ? { model: AccountStaff, as: "Staff", modelAlias: "Staff", instanceAlias: "accountStaff" }
      : { model: AccountUser, as: "User", modelAlias: "User", instanceAlias: "accountUser" };
  const accountInstance = await Account.findOne({
    include: [
      {
        model: checkInWhere.model,
        as: checkInWhere.as,
        include: [
          {
            model: Account,
            as: "Account",
            where: {
              [Op.or]: {
                username,
                email: username
              }
            },
            required: true
          }
        ],
        required: true
      }
    ]
  });
  if (!accountInstance) {
    throw new HttpError(...ERRORS.AUTH.LOGIN_USERNAME);
  }

  // Check password
  const checkResult = await bcrypt.compare(password, accountInstance.password);
  if (!checkResult) {
    throw new HttpError(...ERRORS.AUTH.LOGIN_PASSWORD);
  }

  // Check locked
  if (accountInstance[checkInWhere.modelAlias].locked === true) {
    throw new HttpError(...ERRORS.AUTH.ISLOCKED);
  }

  // Create token
  const userData = {
    id: accountInstance.id,
    [`${checkInWhere.instanceAlias}Id`]: accountInstance[checkInWhere.modelAlias].id,
    username: accountInstance.username,
    email: accountInstance.email,
    role: accountInstance.role
  };
  if (req.authFor === authConfig.identifier.STAFF) {
    // Append role into userData if signing into MANAGE
    const accountStaffInstance = await AccountStaff.findOne({
      where: { accountId: accountInstance.id },
      raw: true
    });
    userData.role = accountStaffInstance.roleId;
  }
  const accessToken = await jwtUtils.generateToken(userData, secretKey.access, tokenLife.access);
  const refreshToken = await jwtUtils.generateToken(userData, secretKey.refresh, tokenLife.refresh);

  // (Remember me) Save Refresh Token to Redis
  // If no "Remember", client should not be able to perform refresh token => Not saving to Redis
  if (remember) {
    // Establish Redis connection
    const redisClient = redisService.redisClientInit();
    // Retrieve Refresh Token list if exists
    const storedRefreshTokens = await redisClient
      .get(userData.id)
      .then(val => (JSON.parse(val) ? JSON.parse(val).refreshTokens : [])); // TODO: Upgrade to OPTIONAL CHAINING
    // .then(val => JSON.parse(val)?.refreshTokens || [])
    storedRefreshTokens.push(refreshToken);
    await redisClient.set(userData.id, JSON.stringify({ refreshTokens: storedRefreshTokens }));
  }

  return {
    accessToken,
    refreshToken,
    account: userData
  };
};

exports.performSignOut = async (refreshTokenFromClient, accountId) => {
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  // Remove Refresh Token from refreshToken list based on cookie's token and accountId
  const updatedRefreshTokens = await redisClient
    .get(accountId)
    .then(val =>
      (JSON.parse(val) ? JSON.parse(val).refreshTokens : []).filter(
        token => token !== refreshTokenFromClient
      )
    );
  await redisClient.set(accountId, JSON.stringify({ refreshTokens: updatedRefreshTokens }));
  return 1;
};

exports.performSignOutAllSessions = async accountId => {
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  // Delete refreshToken from Redis based on accountId
  await redisClient.del(accountId);
  return 1;
};

exports.performRefreshToken = async refreshTokenFromClient => {
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  // Verify Refresh Token sent from Client
  let decoded = null;
  try {
    decoded = await jwtUtils.verifyToken(refreshTokenFromClient, secretKey.refresh);
  } catch (error) {
    throw new LogError("JSONWebTokenError", "Invalid refresh token");
  }
  // Retrieve Refresh Token list by user id, check if exists
  const userData = decoded.data;
  const storedRefreshToken = await redisClient.get(userData.id).then(val => {
    // TODO: Upgrade to OPTIONAL CHAINING
    const refreshTokens = JSON.parse(val) ? JSON.parse(val).refreshTokens : null;
    if (refreshTokens) {
      return refreshTokens.find(token => token === refreshTokenFromClient) || null;
    }
    return null;
  });
  // .then((val) => JSON.parse(val)?.refreshTokens?.find(token => token === refreshTokenFromClient))
  if (!storedRefreshToken || storedRefreshToken !== refreshTokenFromClient) {
    throw new LogError(
      "RedisRefreshTokenError",
      "No token in system matches the provided, verified token (INTRUDER ALERT!)"
    );
  }
  // Generate new access token if all validations passed
  const accessToken = await jwtUtils.generateToken(userData, secretKey.access, tokenLife.access);
  return accessToken;
};
