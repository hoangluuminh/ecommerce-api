const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { paginationInfo } = require("../utils/pagination.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const itemService = require("../services/item.service");

const controllerName = "[item.controller]";

// GET: List of products
exports.getItems = async (req, res, next) => {
  const actionName = "getItems";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const {
    // query,
    page,
    size,
    sort,
    sortDesc,
    special,
    scale,
    type,
    maker,
    brand,
    year,
    price,
    variationName,
    withHidden
  } = req.query;
  const query = req.query.query || "";
  const attributes = {};
  const attributeKeys = Object.keys(req.query).filter(key => key.indexOf("attributes.") === 0);
  attributeKeys.forEach(attrK => {
    attributes[attrK.split(".")[1]] = req.query[attrK];
  });
  // Executions
  try {
    const { items, count } = await itemService.getItems(
      query,
      page,
      size,
      sort,
      sortDesc,
      special,
      scale,
      type,
      maker,
      brand,
      year,
      price,
      variationName,
      attributes,
      withHidden,
      req.jwtDecoded ? req.jwtDecoded.data.accountUserId || null : null
    );
    return res.json({
      items,
      pagination: paginationInfo(page, size, count, 5)
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Product detail
exports.getItem = async (req, res, next) => {
  const actionName = "getItem";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId } = req.params;
  const { silent, keepAttr } = req.query;
  // Executions
  try {
    const item = await itemService.getItem(
      itemId,
      silent,
      keepAttr,
      req.jwtDecoded ? req.jwtDecoded.data.accountUserId || null : null
    );
    return res.json({ item });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEM[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Search suggestion
exports.getSuggestions = async (req, res, next) => {
  const actionName = "getSuggestions";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { query } = req.query;
  // Executions
  try {
    const values = await itemService.getSuggestions(query);
    return res.json({ values });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Item filter values
exports.getItemFilterValues = async (req, res, next) => {
  const actionName = "getItemFilterValues";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    const values = await itemService.getItemFilterValues();
    return res.json({ values });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add Item
exports.addItem = async (req, res, next) => {
  const actionName = "addItem";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const {
    id,
    name,
    scale,
    type,
    maker,
    brand,
    year,
    price,
    blog,
    hidden,
    images,
    variations,
    attributes
  } = req.body;
  // Executions
  try {
    await itemService.addItem(
      id,
      name,
      scale,
      type,
      maker,
      brand,
      year,
      price,
      blog,
      hidden,
      images,
      variations,
      attributes // {"seat": {"value": "", "rating": ""}}
    );
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.UNIQUE.ITEM[0],
        ERRORS.INVALID.SCALE[0],
        ERRORS.INVALID.TYPE[0],
        ERRORS.INVALID.MAKER[0],
        ERRORS.INVALID.BRAND[0],
        ERRORS.INVALID.ATTRIBUTE[0],
        ERRORS.MISC.ATTRIBUTE_DYNAMIC[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PUT: Update Item
exports.updateItem = async (req, res, next) => {
  const actionName = "updateItem";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId: id } = req.params;
  const {
    name,
    scale,
    type,
    maker,
    brand,
    year,
    price,
    blog,
    hidden,
    images,
    variations,
    attributes
  } = req.body;
  // Executions
  try {
    await itemService.updateItem(
      id,
      name,
      scale,
      type,
      maker,
      brand,
      year,
      price,
      blog,
      hidden,
      images,
      variations,
      attributes
    );
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.ITEM[0],
        ERRORS.INVALID.SCALE[0],
        ERRORS.INVALID.TYPE[0],
        ERRORS.INVALID.MAKER[0],
        ERRORS.INVALID.BRAND[0],
        ERRORS.INVALID.ATTRIBUTE[0],
        ERRORS.MISC.ATTRIBUTE_DYNAMIC[0],
        //
        ERRORS.MISC.ITEM_VARIATIONMISSING[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Hide Item
exports.hideItem = async (req, res, next) => {
  const actionName = "hideItem";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId } = req.params;
  const { hidden } = req.body;
  // Executions
  try {
    await itemService.hideItem(itemId, hidden);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEM[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Delete Item
exports.deleteItem = async (req, res, next) => {
  const actionName = "deleteItem";
  // Declarations
  const { itemId } = req.params;
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    await itemService.deleteItem(itemId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEM[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};
