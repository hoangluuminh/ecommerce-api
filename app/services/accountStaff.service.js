const bcrypt = require("bcrypt");
const validator = require("validator");
const db = require("../models");

const { Op } = db.Sequelize;

const { account: Account, accountStaff: AccountStaff, staffRole: StaffRole } = db;
const HttpError = require("../models/classes/http-error");
const { ERRORS } = require("../utils/const.utils");
const generateId = require("../utils/id.utils");
const { performSignOutAllSessions } = require("./auth.service");

// BCrypt Password Salt
const saltRounds = 10;

// GET: Get users info
exports.getAccountStaffs = async (
  query,
  page,
  size,
  sort,
  sortDesc,
  roleIdString,
  lockedString
) => {
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
    case "accountStaffId": {
      orders = [[{ model: AccountStaff, as: "Staff" }, "id", sortDesc ? "DESC" : "ASC"]];
      break;
    }
    case "roleId":
    case "locked": {
      orders = [[{ model: AccountStaff, as: "Staff" }, sort, sortDesc ? "DESC" : "ASC"]];
      break;
    }
  }
  // Conditions
  const roleIds = roleIdString ? roleIdString.split(",") : null;
  const lockeds = lockedString ? lockedString.split(",") : null;
  let conditionRoleId = db.sequelize.literal("1=1");
  let conditionLocked = db.sequelize.literal("1=1");
  if (roleIds) {
    conditionRoleId = roleIds.map(roleId => ({ roleId }));
  }
  if (lockeds) {
    conditionLocked = lockeds.map(locked => ({ locked: validator.toBoolean(locked) }));
  }
  // Executions
  const { rows: accounts, count } = await Account.findAndCountAll({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
        where: {
          [Op.and]: [{ [Op.or]: conditionRoleId }, { [Op.or]: conditionLocked }]
        },
        include: [{ model: StaffRole, as: "Role" }],
        required: true
      }
    ],
    attributes: ["id", "username", "email", "createdAt", "updatedAt"],
    offset: (page - 1) * size,
    limit: size,
    where: {
      [Op.or]: {
        id: { [Op.substring]: query },
        "$Staff.id$": { [Op.substring]: query },
        username: { [Op.substring]: query },
        email: { [Op.substring]: query }
      }
    },
    order: orders
  });
  return { accounts, count };
};

// GET: Get user info by id
// GET: Get current logged-in user info
const getAccountStaff = async accountStaffId => {
  // Executions
  const account = await Account.findOne({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
        where: {
          id: accountStaffId
        },
        include: [{ model: StaffRole, as: "Role" }],
        required: true
      }
    ],
    attributes: ["id", "username", "email", "createdAt", "updatedAt"]
  });
  return account;
};
exports.getAccountStaff = getAccountStaff;

// GET: Get Staff roles list
exports.getStaffRoles = async () => {
  // Executions
  const roles = await StaffRole.findAll();
  return roles;
};
exports.getAccountStaff = getAccountStaff;

// POST: Perform Staff sign up (with userInfo)
exports.performStaffSignUp = async (username, password, email, roleId, locked) => {
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
  // Validations
  const existingRole = await StaffRole.findOne({
    where: { id: roleId }
  });
  if (!existingRole) {
    throw new HttpError(...ERRORS.INVALID.STAFF_ROLE);
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
    await AccountStaff.create(
      {
        id: generateId(),
        accountId: account.id,
        roleId,
        locked: validator.toBoolean(locked)
      },
      { transaction: t }
    );
  });

  return true;
};

// PATCH: Update user password
// PATCH: Update current logged-in user password
exports.updateAccountStaffPassword = async (id, password, oldPassword) => {
  // Validation
  const account = await Account.findOne({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
        where: {
          id
        },
        required: true
      }
    ]
  });
  if (!account) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTSTAFF);
  }
  if (oldPassword) {
    const checkResult = await bcrypt.compare(oldPassword, account.password);
    if (!checkResult) {
      throw new HttpError(...ERRORS.INVALID.OLDPASSWORD);
    }
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Executions
  await Account.update({ password: hashedPassword }, { where: { id: account.id } });
  return true;
};

// PATCH: Update staff's role
exports.updateStaffRole = async (id, roleId) => {
  // Validation
  const account = await Account.findOne({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
        where: {
          id
        },
        required: true
      }
    ]
  });
  if (!account) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTSTAFF);
  }
  // Executions
  await AccountStaff.update({ roleId }, { where: { id } });
  return true;
};

// PATCH: Update user's access to system
exports.updateAccountStaffLocked = async (id, locked) => {
  // Validation
  const account = await Account.findOne({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
        where: {
          id
        },
        required: true
      }
    ]
  });
  if (!account) {
    throw new HttpError(...ERRORS.INVALID.ACCOUNTSTAFF);
  }
  // Executions
  await AccountStaff.update({ locked }, { where: { id } });
  if (locked === true) {
    await performSignOutAllSessions(account.id);
  }
  return true;
};

// DELETE: Terminate user's account
exports.deleteAccountStaff = async id => {
  const account = await Account.findOne({
    include: [
      {
        model: AccountStaff,
        as: "Staff",
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
