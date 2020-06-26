const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const typeService = require("../services/type.service");

const controllerName = "[type.controller]";

// GET: List of types
exports.getTypes = async (req, res, next) => {
  const actionName = "getTypes";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    const { types, count } = await typeService.getTypes();
    return res.json({
      types,
      count
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Type detail
exports.getType = async (req, res, next) => {
  const actionName = "getType";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { typeId } = req.params;
  // Executions
  try {
    const type = await typeService.getType(typeId);
    return res.json({ type });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.TYPE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add Type
exports.addType = async (req, res, next) => {
  const actionName = "addType";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id, name, description } = req.body;
  // Executions
  try {
    await typeService.addType(id, name, description);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.UNIQUE.TYPE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PUT: Update Type
exports.updateType = async (req, res, next) => {
  const actionName = "updateType";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { typeId: id } = req.params;
  const { name, description } = req.body;
  // Executions
  try {
    await typeService.updateType(id, name, description);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.TYPE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Swap Types
exports.swapTypes = async (req, res, next) => {
  const actionName = "swapTypes";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { type1Id } = req.params;
  const { type2Id } = req.body;
  // Executions
  try {
    await typeService.swapTypes(type1Id, type2Id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.TYPE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Delete Type
exports.deleteType = async (req, res, next) => {
  const actionName = "deleteType";
  // Declarations
  const { typeId } = req.params;
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    await typeService.deleteType(typeId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.TYPE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
