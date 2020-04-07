const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging-utils");
const { paginationInfo } = require("../utils/pagination-utils");
const { ERRORS } = require("../utils/const-utils");
const HttpError = require("../models/http-error");

const itemService = require("../services/item-service");

const controllerName = "[item-controller]";

exports.getItem = async (req, res, next) => {
  const actionName = "getItem";
  // Declarations
  const { itemId } = req.params;
  // Executions
  try {
    const item = await itemService.getItem(itemId);
    return res.json({ item });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.ITEM));
  }
};

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
    query,
    page,
    size,
    sort,
    sortDesc,
    priceFrom,
    priceTo,
    brand,
    category,
    noImg
  } = req.query;
  // Executions
  try {
    const { items, count } = await itemService.getItems(
      query,
      page,
      size,
      sort,
      sortDesc,
      priceFrom,
      priceTo,
      brand,
      category,
      noImg
    );
    return res.json({
      items,
      pagination: paginationInfo(page, size, count, 5)
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.ITEMS));
  }
};

exports.addItem = async (req, res, next) => {
  const actionName = "addItem";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id, name, masp, priceOg, price, description, brand, category, itemImgs } = req.body;
  // Executions
  try {
    const item = await itemService.addItem(
      id,
      name,
      masp,
      priceOg,
      price,
      description,
      brand,
      category,
      itemImgs
    );
    return res.json({ item });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return next(new HttpError(...ERRORS.DUPLICATE.ITEM));
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD.ITEM));
  }
};

exports.addImgToItem = async (req, res, next) => {
  const actionName = "addImgToItem";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId } = req.params;
  const { img } = req.body;
  // Executions
  try {
    const itemImg = await itemService.addImgToItem(itemId, img);
    return res.json({ itemImg });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return next(new HttpError(...ERRORS.INVALID.ITEM));
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return next(new HttpError(...ERRORS.DUPLICATE.ITEMIMGURL));
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD.ITEMIMG));
  }
};

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
  const { name, masp, priceOg, price, description, brand, category } = req.body;
  // Executions
  try {
    const result = await itemService.updateItem(
      id,
      name,
      masp,
      priceOg,
      price,
      description,
      brand,
      category
    );
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.ITEM));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.ITEM));
  }
};

exports.swapItemImgs = async (req, res, next) => {
  const actionName = "swapItemImgs";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId: id } = req.params;
  const { itemImg1Id, itemImg2Id } = req.body;
  // Executions
  try {
    await itemService.swapItemImgs(id, itemImg1Id, itemImg2Id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEMIMGS[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.SWAP.ITEMIMGS));
  }
};

exports.setItemRemain = async (req, res, next) => {
  const actionName = "setItemRemain";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId: id } = req.params;
  const { remain } = req.body;
  // Executions
  try {
    const result = await itemService.setItemRemain(id, remain);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.ITEM));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UPDATE.ITEM_REMAIN));
  }
};

exports.setItemHidden = async (req, res, next) => {
  const actionName = "setItemHidden";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId: id } = req.params;
  const { hidden } = req.body;
  // Executions
  try {
    const result = await itemService.setItemHidden(id, hidden);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.ITEM));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UPDATE.ITEM_HIDDEN));
  }
};

exports.deleteItem = async (req, res, next) => {
  const actionName = "deleteItem";
  // Declarations
  const { itemId } = req.params;
  // Executions
  try {
    const result = await itemService.deleteItem(itemId);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.ITEM));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE.ITEM));
  }
};

exports.deleteItemImg = async (req, res, next) => {
  const actionName = "deleteItemImg";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId, itemImgId } = req.params;
  // Executions
  try {
    await itemService.deleteItemImg(itemId, itemImgId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ITEMIMG[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE.ITEMIMG));
  }
};
