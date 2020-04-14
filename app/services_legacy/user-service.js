const bcrypt = require("bcrypt");
const db = require("../models");

const { Op } = db.Sequelize;
const { userAccount: UserAccount, userRole: UserRole } = db;
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const-utils");

// BCrypt Password Salt
const saltRounds = 10;

// GET: Get users info
exports.getUsers = async (query, page, size, sort, sortDesc) => {
  // Orders
  const orders = [[sort, sortDesc ? "DESC" : "ASC"]];
  // Final Conditions
  const conditions = {
    // query
    [Op.or]: {
      username: { [Op.substring]: query },
      email: { [Op.substring]: query },
      lastname: { [Op.substring]: query },
      firstname: { [Op.substring]: query }
    }
  };
  // Executions
  const { rows: userAccounts, count } = await UserAccount.findAndCountAll({
    attributes: [
      "id",
      "username",
      "email",
      "lastname",
      "firstname",
      "role",
      "locked",
      "createdAt",
      "updatedAt"
    ],
    offset: (page - 1) * size,
    limit: size,
    where: conditions,
    order: orders
  });
  return { userAccounts, count };
};

// GET: Get user info by id
// GET: Get current logged-in user info
exports.getUser = async userAccountId => {
  // Executions
  const userAccount = await UserAccount.findOne({
    attributes: [
      "id",
      "username",
      "email",
      "lastname",
      "firstname",
      "role",
      "locked",
      "createdAt",
      "updatedAt"
    ],
    where: {
      id: userAccountId
    }
  });
  return userAccount;
};

// POST: Perform User sign up (with userInfo)
exports.performSignUp = async (username, password, email, lastname, firstname) => {
  // Validations
  const existingUsername = await UserAccount.findOne({
    where: { username }
  });
  if (existingUsername) {
    throw new HttpError(...ERRORS.UNIQUE.USER_USERNAME);
  }
  const existingEmail = await UserAccount.findOne({
    where: { email }
  });
  if (existingEmail) {
    throw new HttpError(...ERRORS.UNIQUE.USER_EMAIL);
  }
  // Declarations
  const id = new Date().getTime();
  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Executions
  const userAccount = await UserAccount.create({
    id,
    username,
    password: hashedPassword,
    email,
    lastname,
    firstname,
    role: "manager"
  });
  return {
    id: userAccount.dataValues.id,
    username: userAccount.dataValues.username,
    email: userAccount.dataValues.email,
    lastname: userAccount.dataValues.lastname,
    firstname: userAccount.dataValues.firstname,
    createdAt: userAccount.dataValues.createdAt,
    updatedAt: userAccount.dataValues.updatedAt
  };
};

// PUT: Update user info (excluding password)
exports.updateUserInfo = async (id, lastname, firstname) => {
  const results = await UserAccount.update({ lastname, firstname }, { where: { id } });
  return results[0];
};

// PATCH: Update user password
// PATCH: Update current logged-in user password
exports.updateUserPassword = async (id, password) => {
  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Executions
  const results = await UserAccount.update({ password: hashedPassword }, { where: { id } });
  return results[0];
};

// PATCH: Update user's role
exports.updateUserRole = async (id, role) => {
  // Validations
  const existingRole = await UserRole.findOne({
    where: { id: role }
  });
  if (!existingRole) {
    throw new HttpError(...ERRORS.INVALID.USER_ROLE);
  }
  // Executions
  const results = await UserAccount.update({ role }, { where: { id } });
  return results[0];
};

// PATCH: Update user's access to system
exports.updateUserLocked = async (id, locked) => {
  // Converting boolean to int
  const boolLocked = locked ? 1 : 0;
  // Executions
  const results = await UserAccount.update({ locked: boolLocked }, { where: { id } });
  return results[0];
};

// DELETE: Terminate user's account
exports.deleteUser = async id => {
  const existingUser = await UserAccount.findOne({
    where: { id }
  });
  if (!existingUser) {
    throw new HttpError(...ERRORS.INVALID.USER);
  }
  await UserAccount.destroy({ where: { id } });
};
