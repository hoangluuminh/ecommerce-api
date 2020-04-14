const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging-utils");
const { ERRORS } = require("../utils/const-utils");
const HttpError = require("../models/classes/http-error");

const categoryService = require("../services/category-service");

const controllerName = "[category-controller]";

exports.getCategory = async (req, res, next) => {
  const actionName = "getCategory";
  // Declarations
  const { categoryId } = req.params;
  // Executions
  try {
    const category = await categoryService.getCategory(categoryId);
    return res.json({ category });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.CATEGORY));
  }
};

exports.getCategories = async (req, res, next) => {
  const actionName = "getCategories";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    const categories = await categoryService.getCategories();
    return res.json({ categories });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.CATEGORIES));
  }
};

exports.addCategory = async (req, res, next) => {
  const actionName = "addCategory";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id, name } = req.body;
  // Executions
  try {
    const category = await categoryService.addCategory(id, name);
    return res.json({ category });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return next(new HttpError(...ERRORS.DUPLICATE.CATEGORY));
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD.CATEGORY));
  }
};

exports.updateCategory = async (req, res, next) => {
  const actionName = "updateCategory";
  // Declarations
  const { categoryId: id } = req.params;
  const { name } = req.body;
  // Executions
  try {
    const result = await categoryService.updateCategory(id, name);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.CATEGORY));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.CATEGORY));
  }
};

exports.deleteCategory = async (req, res, next) => {
  const actionName = "deleteCategory";
  // Declarations
  const { categoryId } = req.params;
  // Executions
  try {
    await categoryService.deleteCategory(categoryId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.CATEGORY[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE.CATEGORY));
  }
};
