const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const cartService = require("../services/cart.service");

const controllerName = "[cart.controller]";

// GET: User's cart details
exports.getMeCartDetails = async (req, res, next) => {
  const actionName = "getMeCartDetails";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id: accountId } = req.jwtDecoded.data;
  // Executions
  try {
    const cartList = await cartService.getRedisCartList(accountId);
    const cartDetails = await cartService.getCartDetails(cartList);
    return res.json({ cartDetails });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Cart details from localStorage cart list
exports.getLocalCartDetails = async (req, res, next) => {
  const actionName = "getLocalCartDetails";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { cart } = req.body;
  // Executions
  try {
    const cartDetails = await cartService.getCartDetails(cart);
    return res.json({ cartDetails });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Sync localStorage's cart with user's cart from Redis
exports.performSyncCart = async (req, res, next) => {
  const actionName = "performSyncCart";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id: accountId } = req.jwtDecoded.data;
  const { cart } = req.body;
  // Executions
  try {
    const cartDetails = await cartService.performSyncCart(accountId, cart);
    return res.json({ cartDetails });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add item to cart
exports.addItemToCart = async (req, res, next) => {
  const actionName = "addItemToCart";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId, variationId, quantity, cart } = req.body;
  let accountId = null;
  if (req.jwtDecoded) {
    accountId = req.jwtDecoded.data.id;
  }
  // Executions
  try {
    const { cartList, cartDetails } = await cartService.performInteractCart(
      accountId,
      itemId,
      variationId,
      quantity,
      cart,
      { action: "add" }
    );
    return res.json({ cartList, cartDetails });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.ITEM[0],
        ERRORS.INVALID.ITEMVARIATION[0],
        ERRORS.MISC.ORDER_QUANTITY[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PATCH: Update quantity of item in cart
exports.updateItemCartQuantity = async (req, res, next) => {
  const actionName = "updateItemCartQuantity";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { itemId, variationId, quantity, cart } = req.body;
  let accountId = null;
  if (req.jwtDecoded) {
    accountId = req.jwtDecoded.data.id;
  }
  // Executions
  try {
    const { cartList, cartDetails } = await cartService.performInteractCart(
      accountId,
      itemId,
      variationId,
      quantity,
      cart,
      { action: "update" }
    );
    return res.json({ cartList, cartDetails });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.ITEM[0],
        ERRORS.INVALID.ITEMVARIATION[0],
        ERRORS.MISC.ORDER_QUANTITY[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// DELETE: Remove item out of cart
exports.deleteItemFromCart = async (req, res, next) => {
  const actionName = "deleteItemFromCart";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id: accountId } = req.jwtDecoded.data;
  const { itemId, variationId } = req.body;
  // Executions
  try {
    await cartService.deleteItemFromCart(accountId, itemId, variationId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
