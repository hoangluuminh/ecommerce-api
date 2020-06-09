const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const userFavItemService = require("../services/userFavItem.service");

const controllerName = "[userFavItem.controller]";

// GET: List of userFavItems (by userId)
exports.getUserFavItems = async (req, res, next) => {
  const actionName = "getUserFavItems";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId: userId } = req.jwtDecoded.data;
  // Executions
  try {
    const { userFavItems, count } = await userFavItemService.getUserFavItems(userId);
    return res.json({
      userFavItems,
      count
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add UserFavItem
exports.addUserFavItem = async (req, res, next) => {
  const actionName = "addUserFavItem";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId } = req.body;
  const { accountUserId: userId } = req.jwtDecoded.data;
  // Executions
  try {
    await userFavItemService.addUserFavItem(userId, itemId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEM[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// DELETE: Delete UserFavItem (based on itemId)
exports.deleteUserFavItem = async (req, res, next) => {
  const actionName = "deleteUserFavItem";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId: userId } = req.jwtDecoded.data;
  const { itemId } = req.params;
  // Executions
  try {
    await userFavItemService.deleteUserFavItem(userId, itemId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEM[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
