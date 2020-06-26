const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const makerService = require("../services/maker.service");

const controllerName = "[maker.controller]";

// GET: List of makers
exports.getMakers = async (req, res, next) => {
  const actionName = "getMakers";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    const { makers, count } = await makerService.getMakers();
    return res.json({
      makers,
      count
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Maker detail
exports.getMaker = async (req, res, next) => {
  const actionName = "getMaker";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { makerId } = req.params;
  // Executions
  try {
    const maker = await makerService.getMaker(makerId);
    return res.json({ maker });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.MAKER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add Maker
exports.addMaker = async (req, res, next) => {
  const actionName = "addMaker";
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
    await makerService.addMaker(id, name, description);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.UNIQUE.MAKER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PUT: Update Maker
exports.updateMaker = async (req, res, next) => {
  const actionName = "updateMaker";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { makerId: id } = req.params;
  const { name, description } = req.body;
  // Executions
  try {
    await makerService.updateMaker(id, name, description);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.MAKER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Swap Makers
exports.swapMakers = async (req, res, next) => {
  const actionName = "swapMakers";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { maker1Id } = req.params;
  const { maker2Id } = req.body;
  // Executions
  try {
    await makerService.swapMakers(maker1Id, maker2Id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.MAKER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Delete Maker
exports.deleteMaker = async (req, res, next) => {
  const actionName = "deleteMaker";
  // Declarations
  const { makerId } = req.params;
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    await makerService.deleteMaker(makerId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.MAKER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
