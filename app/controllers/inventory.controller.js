const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { paginationInfo } = require("../utils/pagination.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const inventoryService = require("../services/inventory.service");

const controllerName = "[inventory.controller]";

// GET: List of inventories
exports.getInventories = async (req, res, next) => {
  const actionName = "getInventories";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { query, page, size, sort, sortDesc, itemId } = req.query;
  // Executions
  try {
    const { inventories, count } = await inventoryService.getInventories(
      query,
      page,
      size,
      sort,
      sortDesc,
      itemId
    );
    return res.json({
      inventories,
      pagination: paginationInfo(page, size, count, 5)
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Inventory detail
exports.getInventory = async (req, res, next) => {
  const actionName = "getInventory";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { inventoryId } = req.params;
  // Executions
  try {
    const inventory = await inventoryService.getInventory(inventoryId);
    return res.json({ inventory });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.INVENTORY[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add Inventories
exports.addInventories = async (req, res, next) => {
  const actionName = "addInventories";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { inventories } = req.body;
  // Executions
  try {
    await inventoryService.addInventories(inventories);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEM[0], ERRORS.MISC.INVENTORY_INCORRECTITEM[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PUT: Update Inventory
exports.updateInventory = async (req, res, next) => {
  const actionName = "updateInventory";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { inventoryId: id } = req.params;
  const { variationId, available } = req.body;
  // Executions
  try {
    await inventoryService.updateInventory(id, variationId, available);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.INVENTORY[0],
        ERRORS.INVALID.ITEMVARIATION[0],
        ERRORS.MISC.INVENTORY_INCORRECTITEM[0],
        ERRORS.MISC.INVENTORY_BOUGHT[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};
