const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const itemCommentService = require("../services/itemComment.service");

const controllerName = "[itemComment.controller]";

// GET: List of itemComments (by userId)
exports.getUserItemComments = async (req, res, next) => {
  const actionName = "getUserItemComments";
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
    const { itemComments, count } = await itemCommentService.getUserItemComments(userId);
    return res.json({
      itemComments,
      count
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: List of user's purchased items (by userId)
exports.getUserPurchasedItems = async (req, res, next) => {
  const actionName = "getUserPurchasedItems";
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
    const { items, count } = await itemCommentService.getUserPurchasedItems(userId);
    return res.json({
      items,
      count
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add ItemComment
exports.addItemComment = async (req, res, next) => {
  const actionName = "addItemComment";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId, rating, comment } = req.body;
  const { accountUserId: userId } = req.jwtDecoded.data;
  // Executions
  try {
    await itemCommentService.addItemComment(userId, itemId, rating, comment);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEM[0], ERRORS.MISC.ITEMCOMMENT_UNOWNED[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// DELETE: Delete ItemComment (based on itemId)
exports.deleteItemComment = async (req, res, next) => {
  const actionName = "deleteItemComment";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId: userId } = req.jwtDecoded.data;
  const { itemCommentId } = req.params;
  // Executions
  try {
    await itemCommentService.deleteItemComment(userId, itemCommentId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEMCOMMENT[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
