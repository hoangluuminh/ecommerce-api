const { validationResult } = require("express-validator");
const _ = require("lodash");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const attributeService = require("../services/attribute.service");

const controllerName = "[attribute.controller]";

// GET: List of attributes
exports.getAttributes = async (req, res, next) => {
  const actionName = "getAttributes";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    const { attributes, count } = await attributeService.getAttributes();
    return res.json({
      attributes,
      count
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Attribute detail
exports.getAttribute = async (req, res, next) => {
  const actionName = "getAttribute";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { attributeId } = req.params;
  // Executions
  try {
    const attribute = await attributeService.getAttribute(attributeId);
    return res.json({ attribute });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ATTRIBUTE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add Attribute
exports.addAttribute = async (req, res, next) => {
  const actionName = "addAttribute";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id, name, description, valueType } = req.body;
  // Executions
  try {
    await attributeService.addAttribute(id, name, description, valueType);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.UNIQUE.ATTRIBUTE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PUT: Update Attribute
exports.updateAttribute = async (req, res, next) => {
  const actionName = "updateAttribute";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { attributeId: id } = req.params;
  const { name, description } = req.body;
  // Executions
  try {
    await attributeService.updateAttribute(id, name, description);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ATTRIBUTE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Swap Attributes
exports.swapAttributes = async (req, res, next) => {
  const actionName = "swapAttributes";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { attribute1Id } = req.params;
  const { attribute2Id } = req.body;
  // Executions
  try {
    await attributeService.swapAttributes(attribute1Id, attribute2Id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ATTRIBUTE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Delete Attribute
exports.deleteAttribute = async (req, res, next) => {
  const actionName = "deleteAttribute";
  // Declarations
  const { attributeId } = req.params;
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    await attributeService.deleteAttribute(attributeId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ATTRIBUTE[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
