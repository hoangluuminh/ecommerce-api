const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { paginationInfo } = require("../utils/pagination.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const accountStaffService = require("../services/accountStaff.service");

const controllerName = "[accountStaff.controller]";

// GET: Get staffs info
exports.getAccountStaffs = async (req, res, next) => {
  const actionName = "getAccountStaffs";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { query, page, size, sort, sortDesc, roleId, locked } = req.query;
  // Executions
  try {
    const { accounts, count } = await accountStaffService.getAccountStaffs(
      query,
      page,
      size,
      sort,
      sortDesc,
      roleId,
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

// GET: Get staff info by id
exports.getAccountStaff = async (req, res, next) => {
  const actionName = "getAccountStaff";
  // Declarations
  const { accountStaffId } = req.params;
  // Executions
  try {
    const account = await accountStaffService.getAccountStaff(accountStaffId);
    return res.json({ account });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Get current logged-in staff info
exports.getMeAccountStaff = async (req, res, next) => {
  const actionName = "getMeAccountStaff";
  // Declarations
  const { accountStaffId } = req.jwtDecoded.data;
  // Executions
  try {
    const account = await accountStaffService.getAccountStaff(accountStaffId);
    return res.json({ account });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Get Staff roles list
exports.getStaffRoles = async (req, res, next) => {
  const actionName = "getStaffRoles";
  // Executions
  try {
    const roles = await accountStaffService.getStaffRoles();
    return res.json({ roles });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Perform Staff sign up (with staffInfo)
exports.performStaffSignUp = async (req, res, next) => {
  const actionName = "performStaffSignUp";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { username, password, email, roleId, locked } = req.body;
  // Executions
  try {
    await accountStaffService.performStaffSignUp(
      username,
      password,
      email,
      roleId,
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

// PATCH: Update current logged-in staff password
exports.updateMeAccountStaffPassword = async (req, res, next) => {
  const actionName = "updateMeAccountStaffPassword";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountStaffId: id } = req.jwtDecoded.data;
  const { password, oldPassword } = req.body;
  // Executions
  try {
    await accountStaffService.updateAccountStaffPassword(id, password, oldPassword);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ACCOUNTSTAFF[0], ERRORS.INVALID.OLDPASSWORD[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Update staff password
exports.updateAccountStaffPassword = async (req, res, next) => {
  const actionName = "updateAccountStaffPassword";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountStaffId: id } = req.params;
  const { password, oldPassword } = req.body;
  // Executions
  try {
    await accountStaffService.updateAccountStaffPassword(id, password, oldPassword);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.OLDPASSWORD[0], ERRORS.INVALID.ACCOUNTSTAFF].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Update staff's role
exports.updateStaffRole = async (req, res, next) => {
  const actionName = "updateStaffRole";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountStaffId: id } = req.params;
  const { role } = req.body;
  // Executions
  try {
    await accountStaffService.updateStaffRole(id, role);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.STAFF_ROLE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.USER_ROLE));
  }
};

// PATCH: Update staff's access to system
exports.updateAccountStaffLocked = async (req, res, next) => {
  const actionName = "updateAccountStaffLocked";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountStaffId: id } = req.params;
  const { locked } = req.body;
  // Executions
  try {
    await accountStaffService.updateAccountStaffLocked(id, locked);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ACCOUNTSTAFF[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Terminate staff's account
exports.deleteAccountStaff = async (req, res, next) => {
  const actionName = "deleteAccountStaff";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountStaffId: id } = req.params;
  // Executions
  try {
    await accountStaffService.deleteAccountStaff(id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ACCOUNTSTAFF[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
