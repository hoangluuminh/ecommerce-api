const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { paginationInfo } = require("../utils/pagination.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const accountUserService = require("../services/accountUser.service");

const controllerName = "[accountUser.controller]";

// GET: Get users info
exports.getAccountUsers = async (req, res, next) => {
  const actionName = "getAccountUsers";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { query, page, size, sort, sortDesc, locked } = req.query;
  // Executions
  try {
    const { accounts, count } = await accountUserService.getAccountUsers(
      query,
      page,
      size,
      sort,
      sortDesc,
      locked
    );
    return res.json({
      accounts,
      pagination: paginationInfo(page, size, count, 5)
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Get user info by id
exports.getAccountUser = async (req, res, next) => {
  const actionName = "getAccountUser";
  // Declarations
  const { accountUserId } = req.params;
  // Executions
  try {
    const account = await accountUserService.getAccountUser(accountUserId);
    return res.json({ account });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Get current logged-in user info
exports.getMeAccountUser = async (req, res, next) => {
  const actionName = "getMeAccountUser";
  // Declarations
  const { accountUserId } = req.jwtDecoded.data;
  // Executions
  try {
    const account = await accountUserService.getAccountUser(accountUserId);
    return res.json({ account });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Perform User sign up (with userInfo)
exports.performUserSignUp = async (req, res, next) => {
  const actionName = "performUserSignUp";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const {
    username,
    password,
    email,
    lastName,
    firstName,
    phone,
    gender,
    birthday,
    locked
  } = req.body;
  // Executions
  try {
    await accountUserService.performUserSignUp(
      username,
      password,
      email,
      lastName,
      firstName,
      phone,
      gender,
      birthday,
      locked !== undefined ? locked : "0"
    );
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.UNIQUE.USER_USERNAME[0], ERRORS.UNIQUE.USER_EMAIL[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PUT: Update current-user info (excluding password)
exports.updateMeAccountUser = async (req, res, next) => {
  const actionName = "updateMeAccountUser";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId } = req.jwtDecoded.data;
  const { lastName, firstName, phone, gender, birthday, address } = req.body;
  // Executions
  try {
    await accountUserService.updateUserInfo(
      accountUserId,
      lastName,
      firstName,
      phone,
      gender,
      birthday,
      address
    );
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Update current logged-in user password
exports.updateMeAccountUserPassword = async (req, res, next) => {
  const actionName = "updateMeAccountUserPassword";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId: id } = req.jwtDecoded.data;
  const { password, oldPassword } = req.body;
  // Executions
  try {
    await accountUserService.updateAccountUserPassword(id, password, oldPassword);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ACCOUNTUSER[0], ERRORS.INVALID.OLDPASSWORD[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Update user password
exports.updateAccountUserPassword = async (req, res, next) => {
  const actionName = "updateAccountUserPassword";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId: id } = req.params;
  const { password, oldPassword } = req.body;
  // Executions
  try {
    await accountUserService.updateAccountUserPassword(id, password, oldPassword);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ACCOUNTUSER[0], ERRORS.INVALID.OLDPASSWORD[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Update user's access to system
exports.updateAccountUserLocked = async (req, res, next) => {
  const actionName = "updateAccountUserLocked";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId: id } = req.params;
  const { locked } = req.body;
  // Executions
  try {
    await accountUserService.updateAccountUserLocked(id, locked);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ACCOUNTUSER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Terminate user's account
exports.deleteAccountUser = async (req, res, next) => {
  const actionName = "deleteAccountUser";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId: id } = req.params;
  // Executions
  try {
    await accountUserService.deleteAccountUser(id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ACCOUNTUSER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
