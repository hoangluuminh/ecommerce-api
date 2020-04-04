const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging-utils");
const { paginationInfo } = require("../utils/pagination-utils");
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
    return next(new HttpError("Retrieving users unsuccessful. Please try again later", 500));
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
    return next(new HttpError("Retrieving user unsuccessful. Please try again later", 500));
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
    return next(new HttpError("Retrieving current user unsuccessful. Please try again later", 500));
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
    if (["UniqueUsernameError", "UniqueEmailError"].indexOf(error.name) >= 0) {
      return next(new HttpError(error.message, 400));
    }
    return next(new HttpError("Signup unsuccessful", 500));
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
      return next(new HttpError("Specified user cannot be found", 400));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError("Updating current user unsuccessful. Please try again later", 500));
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
      return next(new HttpError("Specified user cannot be found", 400));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(
      new HttpError("Updating current user's password unsuccessful. Please try again later", 500)
    );
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
      return next(new HttpError("Specified user cannot be found", 400));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(
      new HttpError("Updating user's password unsuccessful. Please try again later", 500)
    );
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
      return next(new HttpError("Specified user cannot be found", 400));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (["InvalidRoleError"].indexOf(error.name) >= 0) {
      return next(new HttpError(error.message, 400));
    }
    return next(
      new HttpError("Resetting user's password unsuccessful. Please try again later", 500)
    );
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
      return next(new HttpError("Specified user cannot be found", 400));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(
      new HttpError("Updating user's locked status unsuccessful. Please try again later", 500)
    );
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
    if (["InvalidUserError"].indexOf(error.name) >= 0) {
      return next(new HttpError(error.message, 400));
    }
    return next(new HttpError("Terminating user unsuccessful. Please try again later", 500));
  }
};
