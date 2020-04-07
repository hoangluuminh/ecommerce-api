const { validationResult } = require("express-validator");

const { getUserReqMsg, getDatabaseInteractMsg } = require("../utils/logging-utils");
// const { paginationInfo } = require('../utils/pagination-utils')
const { ERRORS } = require("../utils/const-utils");
const HttpError = require("../models/http-error");

const brandService = require("../services/brand-service");

const controllerName = "[brand-controller]";

exports.getBrand = async (req, res, next) => {
  const actionName = "getBrand";
  // Declarations
  const { brandId } = req.params;
  const { withChild } = req.body;
  // Executions
  try {
    const brand = await brandService.getBrand(brandId, withChild);
    return res.json({ brand });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.BRAND));
  }
};

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
    const brands = await brandService.getBrands();
    return res.json({ brands });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.GET.BRANDS));
  }
};

exports.addBrand = async (req, res, next) => {
  const actionName = "addBrand";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { id, name, superTH } = req.body;
  // Executions
  try {
    const brand = await brandService.addBrand(id, name, superTH);
    return res.json({ brand });
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return next(new HttpError(...ERRORS.DUPLICATE.BRAND));
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return next(new HttpError(...ERRORS.INVALID.BRAND_PARENT));
    }
    return next(new HttpError(...ERRORS.UNKNOWN.ADD.BRAND));
  }
};

exports.updateBrand = async (req, res, next) => {
  const actionName = "updateBrand";
  // Declarations
  const { brandId: id } = req.params;
  const { name } = req.body;
  // Executions
  try {
    const result = await brandService.updateBrand(id, name);
    if (!result) {
      return next(new HttpError(...ERRORS.INVALID.BRAND));
    }
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.UPDATE.BRAND));
  }
};

exports.swapBrands = async (req, res, next) => {
  const actionName = "swapBrands";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { brand1Id, brand2Id } = req.body;
  // Executions
  try {
    await brandService.swapBrands(brand1Id, brand2Id);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.INVALID.BRANDS[0], ERRORS.MISC.BRANDS_PARENTING[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.SWAP.BRANDS));
  }
};

exports.deleteBrand = async (req, res, next) => {
  const actionName = "deleteBrand";
  // Declarations
  const { brandId } = req.params;
  // Executions
  try {
    await brandService.deleteBrand(brandId);
    return res.status(200).send();
  } catch (error) {
    getDatabaseInteractMsg(`${controllerName}.${actionName}`, error);
    if (["SequelizeForeignKeyConstraintError"].indexOf(error.name) >= 0) {
      return next(new HttpError(...ERRORS.MISC.BRANDS_UNDELETABLEPARENT));
    }
    if ([ERRORS.INVALID.BRAND[0]].indexOf(error.name) >= 0) {
      return next(error);
    }
    return next(new HttpError(...ERRORS.UNKNOWN.DELETE.BRAND));
  }
};
