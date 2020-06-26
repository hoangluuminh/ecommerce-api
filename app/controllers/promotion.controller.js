const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { paginationInfo } = require("../utils/pagination.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const promotionService = require("../services/promotion.service");

const controllerName = "[promotion.controller]";

// GET: List of Promotions
exports.getPromotions = async (req, res, next) => {
  const actionName = "getPromotions";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { query, page, size, sort, sortDesc, timeStart, timeEnd } = req.query;
  // Executions
  try {
    const { promotions, count } = await promotionService.getPromotions(
      query,
      page,
      size,
      sort,
      sortDesc,
      timeStart,
      timeEnd
    );
    return res.json({
      promotions,
      pagination: paginationInfo(page, size, count, 5)
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Promotion details
exports.getPromotion = async (req, res, next) => {
  const actionName = "getPromotion";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { promotionId } = req.params;
  // Executions
  try {
    const promotion = await promotionService.getPromotion(promotionId);
    return res.json({ promotion });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.PROMOTION[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add Promotion
exports.addPromotion = async (req, res, next) => {
  const actionName = "addPromotion";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { name, timeStart, timeEnd, offPercent, description, items } = req.body;
  // Executions
  try {
    await promotionService.addPromotion(name, timeStart, timeEnd, offPercent, description, items);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.UNIQUE.PROMOTION[0], ERRORS.INVALID.ITEM[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PUT: Update Promotion
exports.updatePromotion = async (req, res, next) => {
  const actionName = "updatePromotion";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { promotionId: id } = req.params;
  const { name, timeStart, timeEnd, offPercent, description, items } = req.body;
  // Executions
  try {
    await promotionService.updatePromotion(
      id,
      name,
      timeStart,
      timeEnd,
      offPercent,
      description,
      items
    );
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.PROMOTION[0], ERRORS.INVALID.ITEM[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Delete Promotion
exports.deletePromotion = async (req, res, next) => {
  const actionName = "deletePromotion";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { promotionId: id } = req.params;
  // Executions
  try {
    await promotionService.deletePromotion(id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.PROMOTION[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
