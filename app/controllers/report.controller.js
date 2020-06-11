const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const reportService = require("../services/report.service");

const controllerName = "[report.controller]";

// GET: Monthly Sales Report
exports.getMonthlySalesReport = async (req, res, next) => {
  const actionName = "getMonthlySalesReport";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { year } = req.query;
  // Executions
  try {
    const report = await reportService.getMonthlySalesReport(year);
    return res.json({ report });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Product Sales Report
exports.getProductSalesReport = async (req, res, next) => {
  const actionName = "getProductSalesReport";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { timeStart, timeEnd } = req.query;
  // Executions
  try {
    const report = await reportService.getProductSalesReport(timeStart, timeEnd);
    return res.json({ report });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Category Sales Report
exports.getCategorySalesReport = async (req, res, next) => {
  const actionName = "getCategorySalesReport";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { category } = req.params;
  const { timeStart, timeEnd } = req.query;
  // Executions
  try {
    const report = await reportService.getCategorySalesReport(category, timeStart, timeEnd);
    return res.json({ report });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};
