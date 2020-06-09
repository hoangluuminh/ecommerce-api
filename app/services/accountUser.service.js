const bcrypt = require("bcrypt");
const validator = require("validator");

const db = require("../models");

const { Op } = db.Sequelize;
const { account: Account, accountUser: AccountUser, userInfo: UserInfo } = db;

const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");
const { performSignOutAllSessions } = require("./auth.service");

// BCrypt Password Salt
const saltRounds = 10;

// GET: Get users info
exports.getAccountUsers = async (query, page, size, sort, sortDesc, lockedString) => {
  // Declarations
  let orders = [["id", sortDesc ? "DESC" : "ASC"]];
  switch (sort) {
    default: {
      orders = [["createdAt", sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "id":
    case "username":
    case "email":
    case "createdAt":
    case "updatedAt": {
      orders = [[sort, sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "accountUserId": {
      orders = [[{ model: AccountUser, as: "User" }, "id", sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "locked": {
      orders = [[{ model: AccountUser, as: "User" }, sort, sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "lastName":
    case "firstName":
    case "phone":
    case "gender":
    case "birthday": {
      orders = [
        [
          { model: AccountUser, as: "User" },
          { model: UserInfo, as: "Info" },
          sort,
          sortDesc ? "DESC" : "ASC"
        ]
      ];
      break;
    }
  }
  // Conditions
  const lockeds = lockedString ? lockedString.split(",") : null;
  let conditionLocked = db.sequelize.literal("1=1");
  if (lockeds) {
    conditionLocked = lockeds.map(locked => ({ locked: validator.toBoolean(locked) }));
  }
  // Executions
  const { rows: accounts, count } = await Account.findAndCountAll({
    include: [
      {
        model: AccountUser,
        as: "User",
        include: [
          {
            model: UserInfo,
            as: "Info",
            required: true
          }
        ],
        where: {
          [Op.and]: [{ [Op.or]: conditionLocked }]
        },
        required: true
      }
    ],
    attributes: ["id", "username", "email", "createdAt", "updatedAt"],
    offset: (page - 1) * size,
    limit: size,
    where: {
      [Op.or]: {
        id: { [Op.substring]: query },
        "$User.id$": { [Op.substring]: query },
        username: { [Op.substring]: query },
        email: { [Op.substring]: query },
        "$User.Info.lastName$": { [Op.substring]: query },
        "$User.Info.firstName$": { [Op.substring]: query }
      }
    },
    order: orders
  });
  return { accounts, count };
};

// GET: Get user info by id
// GET: Get current logged-in user info
const getAccountUser = async accountUserId => {
  // Executions
  const account = await Account.findOne({
    include: [
      {
        model: AccountUser,
        as: "User",
        where: {
          id: accountUserId
        },
        include: [
          {
            model: UserInfo,
            as: "Info"
          }
        ],
        required: true
      }
    ],
    attributes: ["id", "username", "email", "createdAt", "updatedAt"]
  });
  return account;
};
exports.getAccountUser = getAccountUser;

// POST: Perform User sign up (with userInfo)
exports.performUserSignUp = async (
  username,
  password,
  email,
  lastName,
  firstName,
  phone,
  gender,
  birthday,
  locked
) => {
  // Validations
  const existingUsername = await Account.findOne({
    where: { username }
  });
  if (existingUsername) {
    throw new HttpError(...ERRORS.UNIQUE.USER_USERNAME);
  }
  const existingEmail = await Account.findOne({
    where: { email }
  });
  if (existingEmail) {
    throw new HttpError(...ERRORS.UNIQUE.USER_EMAIL);
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Executions
  db.sequelize.transaction(async t => {
    const account = await Account.create(
      {
        id: generateId(),
        username,
        password: hashedPassword,
        email
      },
      { transaction: t }
    );
    const accountUser = await AccountUser.create(
      {
        id: generateId(),
        accountId: account.id,
        locked: validator.toBoolean(locked)
      },
      { transaction: t }
    );
    await UserInfo.create(
      {
        userId: accountUser.id,
        lastName,
        firstName,
        phone,
        gender,
        birthday
      },
      { transaction: t }
    );
  });

  return true;
};

// PUT: Update user info (excluding password)
exports.updateUserInfo = async (id, lastName, firstName, phone, gender, birthday, address) => {
  // Validation
  const account = await Account.findOne({
    include: [
      {
        model: AccountUser,
        as: "User",
        where: {
          id
        },
        required: true
      }
    ]
  });
  if (!account) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTUSER);
  }
  // Executions
  await UserInfo.update(
    { lastName, firstName, phone, gender, birthday, address },
    { where: { userId: id } }
  );
  return true;
};

// PATCH: Update user password
// PATCH: Update current logged-in user password
exports.updateAccountUserPassword = async (id, password, oldPassword) => {
  // Validation
  const account = await Account.findOne({
    include: [
      {
        model: AccountUser,
        as: "User",
        where: {
          id
        },
        required: true
      }
    ]
  });
  if (!account) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTUSER);
  }
  const checkResult = await bcrypt.compare(oldPassword, account.password);
  if (!checkResult) {
    throw new HttpError(...ERRORS.INVALID.OLDPASSWORD);
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Executions
  await Account.update({ password: hashedPassword }, { where: { id: account.id } });
};

// PATCH: Update user's access to system
exports.updateAccountUserLocked = async (id, locked) => {
  // Validation
  const account = await Account.findOne({
    include: [
      {
        model: AccountUser,
        as: "User",
        where: {
          id
        },
        required: true
      }
    ]
  });
  if (!account) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTUSER);
  }
  // Executions
  await AccountUser.update({ locked }, { where: { id } });
  if (locked === true) {
    await performSignOutAllSessions(account.id);
  }
  return true;
};

// DELETE: Terminate user's account
exports.deleteAccountUser = async id => {
  const account = await Account.findOne({
    include: [
      {
        model: AccountUser,
        as: "User",
        where: {
          id
        },
        required: true
      }
    ]
  });
  if (!account) {
    throw new HttpError(...ERRORS.INVALID.USER);
  }
  await Account.destroy({ where: { id: account.id } });
};
