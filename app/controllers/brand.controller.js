const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging.utils");
const { ERRORS } = require("../utils/const.utils");
const HttpError = require("../models/classes/http-error");

const brandService = require("../services/brand.service");

const controllerName = "[brand.controller]";

// GET: List of brands
exports.getBrands = async (req, res, next) => {
  const actionName = "getBrands";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    const { brands, count } = await brandService.getBrands();
    return res.json({
      brands,
      count
    });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// GET: Brand detail
exports.getBrand = async (req, res, next) => {
  const actionName = "getBrand";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { brandId } = req.params;
  // Executions
  try {
    const brand = await brandService.getBrand(brandId);
    return res.json({ brand });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.BRAND[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.GET));
  }
};

// POST: Add Brand
exports.addBrand = async (req, res, next) => {
  const actionName = "addBrand";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id, name, description } = req.body;
  // Executions
  try {
    await brandService.addBrand(id, name, description);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.UNIQUE.BRAND[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD));
  }
};

// PUT: Update Brand
exports.updateBrand = async (req, res, next) => {
  const actionName = "updateBrand";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { brandId: id } = req.params;
  const { name, description } = req.body;
  // Executions
  try {
    await brandService.updateBrand(id, name, description);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.BRAND[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// PATCH: Swap Brands
exports.swapBrands = async (req, res, next) => {
  const actionName = "swapBrands";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { brand1Id } = req.params;
  const { brand2Id } = req.body;
  // Executions
  try {
    await brandService.swapBrands(brand1Id, brand2Id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.BRAND[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE));
  }
};

// DELETE: Delete Brand
exports.deleteBrand = async (req, res, next) => {
  const actionName = "deleteBrand";
  // Declarations
  const { brandId } = req.params;
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Executions
  try {
    await brandService.deleteBrand(brandId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.BRAND[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE));
  }
};
