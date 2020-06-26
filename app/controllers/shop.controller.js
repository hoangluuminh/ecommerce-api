const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const shopService = require("../services/shop.service");

const controllerName = "[shop.controller]";

// GET: Shop detail
exports.getShop = async (req, res, next) => {
  const actionName = "getShop";
  // Executions
  try {
    const shop = await shopService.getShop();
    return res.json({ shop });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.SHOP[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// PUT: Update Shop
exports.updateShop = async (req, res, next) => {
  const actionName = "updateShop";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { name, locationLng, locationLat, address, phone, description } = req.body;
  // Executions
  try {
    await shopService.updateShop(name, locationLng, locationLat, address, phone, description);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.SHOP[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};
