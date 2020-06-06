const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { paginationInfo } = require("../utils/pagination.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const supportService = require("../services/support.service");

const controllerName = "[support.controller]";

// GET: List of support tickets
exports.getSupportTickets = async (req, res, next) => {
  const actionName = "getSupportTickets";
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
    supportTypeId,
    support,
    customer,
    statusId
  } = req.query;
  // Executions
  try {
    const { supportTickets, count } = await supportService.getSupportTickets(
      query,
      page,
      size,
      sort,
      sortDesc,
      supportTypeId,
      support,
      customer,
      statusId
    );
    return res.json({
      supportTickets,
      pagination: paginationInfo(page, size, count, 5)
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Support Ticket detail
exports.getSupportTicket = async (req, res, next) => {
  const actionName = "getSupportTicket";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { supportTicketId } = req.params;
  // Executions
  try {
    const supportTicket = await supportService.getSupportTicket(supportTicketId);
    return res.json({ supportTicket });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.SUPPORTTICKET[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Support Types List
exports.getSupportTypes = async (req, res, next) => {
  const actionName = "getSupportTypes";
  // Executions
  try {
    const { supportTypes, count } = await supportService.getSupportTypes();
    return res.json({ supportTypes, count });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Support Ticket Statuses List
exports.getSupportTicketStatuses = async (req, res, next) => {
  const actionName = "getSupportTicketStatuses";
  // Executions
  try {
    const { supportTicketStatuses, count } = await supportService.getSupportTicketStatuses();
    return res.json({ supportTicketStatuses, count });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Submit Support Ticket
exports.addSupportTicket = async (req, res, next) => {
  const actionName = "addSupportTicket";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { accountUserId } = req.jwtDecoded.data;
  const { supportTypeId, orderId, note } = req.body;
  // Executions
  try {
    await supportService.addSupportTicket(accountUserId, supportTypeId, orderId, note);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.UNIQUE.SUPPORTTICKET[0],
        ERRORS.INVALID.SUPPORTTYPE[0],
        ERRORS.INVALID.ACCOUNTUSER[0],
        ERRORS.INVALID.ORDER[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PATCH: Update Support Ticket's status
exports.updateSupportTicketStatus = async (req, res, next) => {
  const actionName = "updateSupportTicketStatus";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { supportTicketId } = req.params;
  const { statusId } = req.body;
  const { accountStaffId } = req.jwtDecoded.data;
  // Executions
  try {
    await supportService.updateSupportTicketStatus(supportTicketId, statusId, accountStaffId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (
      [
        ERRORS.INVALID.SUPPORTTICKET[0],
        ERRORS.INVALID.SUPPORTTICKETSTATUS[0],
        ERRORS.INVALID.ACCOUNTSTAFF[0]
      ].indexOf(error.name) >= 0
    ) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Delete Support
exports.deleteSupportTicket = async (req, res, next) => {
  const actionName = "deleteSupportTicket";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { supportTicketId } = req.params;
  // Executions
  try {
    await supportService.deleteSupportTicket(supportTicketId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.SUPPORTTICKET[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
