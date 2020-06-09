const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { paginationInfo } = require("../utils/pagination.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");
const generateId = require("../utils/id.utils");

const orderService = require("../services/order.service");

const controllerName = "[order.controller]";

// GET: List of orders
exports.getOrders = async (req, res, next) => {
  const actionName = "getOrders";
  // Declarations
  const { query, page, size, sort, sortDesc, userId, verifier, statusId } = req.query;
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    const { orders, count } = await orderService.getOrders(
      query,
      page,
      size,
      sort,
      sortDesc,
      userId,
      verifier,
      statusId
    );
    return res.json({
      orders,
      pagination: paginationInfo(page, size, count, 5)
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Order detail
exports.getOrder = async (req, res, next) => {
  const actionName = "getOrder";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { orderId } = req.params;
  // Executions
  try {
    const order = await orderService.getOrder(orderId);
    return res.json({ order });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ORDER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: My orders list
exports.getMeOrders = async (req, res, next) => {
  const actionName = "getMeOrders";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId } = req.jwtDecoded.data;
  // Executions
  try {
    const { orders, count } = await orderService.getMeOrders(accountUserId);
    return res.json({ orders: orders || [], count });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Detailed info of My Order
exports.getMeOrder = async (req, res, next) => {
  const actionName = "getMeOrder";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId } = req.jwtDecoded.data;
  const { orderId } = req.params;
  // Executions
  try {
    const order = await orderService.getMeOrder(accountUserId, orderId);
    return res.json({ order });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ORDER[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Order Statuses List
exports.getOrderStatuses = async (req, res, next) => {
  const actionName = "getOrderStatuses";
  // Executions
  try {
    const { orderStatuses, count } = await orderService.getOrderStatuses();
    return res.json({ orderStatuses, count });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add POS Order
// POST: Add COD Order
exports.addCodOrder = async (req, res, next) => {
  const actionName = "addCodOrder";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { billingDetails, loan, cart } = req.body;
  // check COD || POS
  const userId = req.jwtDecoded.data.accountUserId || req.body.userId;
  // Executions
  try {
    const orderId = generateId();
    await orderService.addOrder(userId, billingDetails, loan, cart, {
      orderId,
      isCod: req.jwtDecoded.data.accountUserId,
      isPos: req.body.userId
    });
    await orderService.assignInventoryItemsToOrderDetails(orderId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.ACCOUNTUSER[0],
        ERRORS.INVALID.ITEM[0],
        ERRORS.INVALID.ITEMVARIATION[0],
        ERRORS.MISC.ORDER_EXCEEDDOWNPAYMENT[0],
        ERRORS.MISC.ORDER_CARTVARIATION[0],
        ERRORS.MISC.ORDER_QUANTITY[0],
        // assignInventoryItemsToOrderDetails
        ERRORS.INVALID.ORDER[0],
        ERRORS.DUPLICATE.INVENTORY[0],
        ERRORS.MISC.ORDER_FORBIDDEN[0],
        ERRORS.MISC.INVENTORY_UNAVAILABLE[0],
        ERRORS.MISC.ORDERDETAIL_MISMATCH[0],
        ERRORS.MISC.INVENTORY_INCORRECTVARIATION[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PATCH: Updating Order's status to "Verified"
exports.verifyOrder = async (req, res, next) => {
  const actionName = "verifyOrder";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountStaffId } = req.jwtDecoded.data;
  const { orderId } = req.params;
  // Executions
  try {
    await orderService.verifyOrder(orderId, accountStaffId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.ORDER[0],
        ERRORS.MISC.ORDER_FORBIDDEN[0],
        ERRORS.INVALID.ACCOUNTSTAFF[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Updating Order's status to "Delivering"
exports.startDeliverOrder = async (req, res, next) => {
  const actionName = "startDeliverOrder";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  // const { accountStaffId } = req.jwtDecoded.data;
  const { orderId } = req.params;
  // Executions
  try {
    await orderService.startDeliverOrder(orderId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ORDER[0], ERRORS.MISC.ORDER_FORBIDDEN[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Updating Order's status to "Delivered"
exports.completeOrder = async (req, res, next) => {
  const actionName = "completeOrder";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  // const { accountStaffId } = req.jwtDecoded.data;
  const { orderId } = req.params;
  // Executions
  try {
    await orderService.completeOrder(orderId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.ORDER[0], ERRORS.MISC.ORDER_FORBIDDEN[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Cancel Order
exports.cancelOrder = async (req, res, next) => {
  const actionName = "cancelOrder";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountStaffId } = req.jwtDecoded.data;
  const { orderId } = req.params;
  // Executions
  try {
    await orderService.cancelOrder(orderId, accountStaffId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.ORDER[0],
        ERRORS.MISC.ORDER_FORBIDDEN[0],
        ERRORS.INVALID.ACCOUNTSTAFF[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};
