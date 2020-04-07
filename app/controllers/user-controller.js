const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging-utils");
const { paginationInfo } = require("../utils/pagination-utils");
const { ERRORS } = require("../utils/const-utils");
const HttpError = require("../models/http-error");

const userService = require("../services/user-service");

const controllerName = "[user-controller]";

// GET: Get users info
exports.getUsers = async (req, res, next) => {
  const actionName = "getUsers";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { query, page, size, sort, sortDesc } = req.query;
  // Executions
  try {
    const { userAccounts, count } = await userService.getUsers(query, page, size, sort, sortDesc);
    return res.json({
      userAccounts,
      pagination: paginationInfo(page, size, count, 5)
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.USERS));
  }
};

// GET: Get user info by id
exports.getUser = async (req, res, next) => {
  const actionName = "getUser";
  // Declarations
  const { userAccountId } = req.params;
  // Executions
  try {
    const userAccount = await userService.getUser(userAccountId);
    return res.json({ userAccount });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.USER));
  }
};

// GET: Get current logged-in user info
exports.getMeInfo = async (req, res, next) => {
  const actionName = "getMeInfo";
  // Declarations
  const { id: userAccountId } = req.jwtDecoded.data;
  // Executions
  try {
    const userAccount = await userService.getUser(userAccountId);
    return res.json({ userAccount });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.USER_MEINFO));
  }
};

// POST: Perform User sign up (with userInfo)
exports.performSignUp = async (req, res, next) => {
  const actionName = "performSignUp";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { username, password, email, lastname, firstname } = req.body;
  // Executions
  try {
    const userAccount = await userService.performSignUp(
      username,
      password,
      email,
      lastname,
      firstname
    );
    return res.json({ userAccount });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.UNIQUE.USER_USERNAME[0], ERRORS.UNIQUE.USER_EMAIL[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD.USER));
  }
};

// PUT: Update current-user info (excluding password)
exports.updateMeInfo = async (req, res, next) => {
  const actionName = "updateMeInfo";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id } = req.jwtDecoded.data;
  const { lastname, firstname } = req.body;
  // Executions
  try {
    const result = await userService.updateUserInfo(id, lastname, firstname);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.USER));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.USER_MEINFO));
  }
};

// PATCH: Update current logged-in user password
exports.updateMePassword = async (req, res, next) => {
  const actionName = "updateMePassword";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id } = req.jwtDecoded.data;
  const { password } = req.body;
  // Executions
  try {
    const result = await userService.updateUserPassword(id, password);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.USER));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.USER_MEPASSWORD));
  }
};

// PATCH: Update user password
exports.updateUserPassword = async (req, res, next) => {
  const actionName = "updateUserPassword";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { userAccountId: id } = req.params;
  const { password } = req.body;
  // Executions
  try {
    const result = await userService.updateUserPassword(id, password);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.USER));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.USER_PASSWORD));
  }
};

// PATCH: Update user's role
exports.updateUserRole = async (req, res, next) => {
  const actionName = "updateUserRole";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { userAccountId: id } = req.params;
  const { role } = req.body;
  // Executions
  try {
    const result = await userService.updateUserRole(id, role);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.USER));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.USER_ROLE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.USER_ROLE));
  }
};

// PATCH: Update user's access to system
exports.updateUserLocked = async (req, res, next) => {
  const actionName = "updateUserLock";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { userAccountId: id } = req.params;
  const { locked } = req.body;
  // Executions
  try {
    const result = await userService.updateUserLocked(id, locked);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.USER));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.USER_LOCKED));
  }
};

// DELETE: Terminate user's account
exports.deleteUser = async (req, res, next) => {
  const actionName = "deleteUser";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { userAccountId: id } = req.params;
  // Executions
  try {
    await userService.deleteUser(id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.USER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE.USER));
  }
};
