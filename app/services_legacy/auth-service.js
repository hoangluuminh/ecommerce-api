const bcrypt = require("bcrypt");
const db = require("../models");

const jwtUtils = require("../utils/jwt-utils");
const { TOKENLIFE: tokenLife, SECRETKEY: secretKey, ERRORS } = require("../utils/const-utils");
const redisService = require("./redis-service");
const HttpError = require("../models/classes/http-error");
const LogError = require("../models/classes/log-error");
// const { fn, col } = db.Sequelize
const UserAccount = db.userAccount;
// const UserRole = db.userRole

exports.performLogin = async (username, password, remember) => {
  // Get user account
  const userAccount = await UserAccount.findOne({
    where: { username },
    raw: true
  });
  if (!userAccount) {
    throw new HttpError(...ERRORS.AUTH.LOGIN_USERNAME);
  }
  // Check password
  const checkResult = await bcrypt.compare(password, userAccount.password);
  if (!checkResult) {
    throw new HttpError(...ERRORS.AUTH.LOGIN_PASSWORD);
  }
  // Create token
  const userData = {
    id: userAccount.id,
    username: userAccount.username,
    email: userAccount.email,
    role: userAccount.role,
    locked: userAccount.locked
  };
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
    userAccount: {
      id: userAccount.id,
      username: userAccount.username,
      email: userAccount.email,
      lastname: userAccount.lastname,
      firstname: userAccount.firstname,
      createdAt: userAccount.createdAt,
      updatedAt: userAccount.updatedAt
    }
  };
};

exports.performSignOut = async (refreshTokenFromClient, userId) => {
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  // Remove Refresh Token from refreshToken list based on cookie's token and userId
  const updatedRefreshTokens = await redisClient
    .get(userId)
    .then(val =>
      (JSON.parse(val) ? JSON.parse(val).refreshTokens : []).filter(
        token => token !== refreshTokenFromClient
      )
    );
  await redisClient.set(userId, JSON.stringify({ refreshTokens: updatedRefreshTokens }));
  return 1;
};

exports.performSignOutAllSessions = async userId => {
  // Establish Redis connection
  const redisClient = redisService.redisClientInit();
  // Delete refreshToken from Redis based on userId
  await redisClient.del(userId);
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
